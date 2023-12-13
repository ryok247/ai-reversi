"use strict";

import { randomAgent, simpleGreedyAgent} from './agents.js'
import { getCookie, setCookie, getCsrfToken } from './utilities.js'
import { loadRecentGames } from './main.js';

export class boardInfo{
    constructor(state, settings, history, boardElement){

        this.state = state;
        this.settings = settings;
        this.history = history;
        this.boardElement = boardElement;

        this.isGameEnd = false;

        if (this.settings.level == 1) this.agent = new randomAgent();
        else if (this.settings.level == 2) this.agent = new simpleGreedyAgent();
        else console.assert(false);

        this.cells = [];
        this.boardElement.innerHTML = "";
    
        // Generate a game board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.boardElement.appendChild(cell);
                this.cells.push(cell);
    
                // Add a click event
                cell.addEventListener("click", this.createCellClickHandler(row, col));
            }
        }
    
        // Place the first 4 stones
        const firstPositions = [27,28,36,35];
        for (let i=0; i<firstPositions.length; i++){
            const newPiece = document.createElement("div");
            newPiece.classList.add("piece", (i % 2 == 0 ? "black": "white"));
            this.cells[firstPositions[i]].appendChild(newPiece);
        }

        if (this.settings.mode == "cp" && this.settings.color == "black") this.highlightPossibleCells();
        else if (this.settings.mode == "manual") this.highlightPossibleCells();
    
    }

    // check the position is valid for placement
    isValidMove(row, col) {

        if (row < 0 || row > 7 || col < 0 || col > 7) return false;

        // impossible if some stone is already placed in the position
        if (this.cells[row * 8 + col].childNodes.length == 1)  return false;

        return this.getFlippedCells(row, col).length > 0;
    }

    // Place a stone
    placePiece(row, col) {

        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", this.state.currentPlayer);
        this.cells[row * 8 + col].appendChild(newPiece);

        // update the number of stones
        if (this.state.currentPlayer === "black") this.state.changeScores(1,0);
        else this.state.changeScores(0,1);

        this.state.counterIncrement();

    }

    // flip stones
    flipPieces(row, col) {

        const flippedCells = this.getFlippedCells(row, col);

        flippedCells.forEach((cell) => {

            if (cell.childNodes.length == 1){
                cell.childNodes[0].classList.toggle("black");
                cell.childNodes[0].classList.toggle("white");
            }

            // update the number of stones
            if (this.state.currentPlayer === "black") this.state.changeScores(1,-1);
            else this.state.changeScores(-1,1);

        });
    }

    // return a possible cells
    getPossibleCells(){
        let possibleCells = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col)) possibleCells.push([row,col]);
            }
        }

        return possibleCells;
    }

    // check if the current player has to pass (no valid place)
    // terminate the game if the both player have to pass
    checkPass(){
        let possibleCells = this.getPossibleCells();

        if (possibleCells.length == 0){

            this.state.counterIncrement();
            this.history.add(-1,-1,true, this);

            this.state.togglePlayer();
            this.state.displayTurn();

            // two passses -> end the game
            possibleCells = this.getPossibleCells()
            if (possibleCells.length == 0) this.endGame();

            this.highlightPossibleCells();

            return true;
        }

        return false;
    }

    // estimated the number of flipped stone if a new stone is placed on (row, col)
    getFlippedCells(row, col){
        const directions = [-1, 0, 1];
        const flippedCells = [];

        directions.forEach((dx) => {
            directions.forEach((dy) => {
                if (dx === 0 && dy === 0) return;

                let currentRow = row + dx;
                let currentCol = col + dy;
                let flipTemp = [];

                while (
                    currentRow >= 0 &&
                    currentRow < 8 &&
                    currentCol >= 0 &&
                    currentCol < 8
                ) {
                    const cell = this.cells[currentRow * 8 + currentCol];
                    if (!cell) break;
                    if (cell.childNodes.length == 0) break;
                    if (cell.childNodes[0].classList.contains(this.state.currentPlayer)) {
                        flippedCells.push(...flipTemp);
                        break;
                    }
                    flipTemp.push(cell);
                    currentRow += dx;
                    currentCol += dy;
                }
            });
        });

        return flippedCells;
    }

    cellClickHandler(row, col){

        const possibleCells = this.getPossibleCells();
    
        if (possibleCells.length == 0){
    
            this.history.add(-1,-1,true, this);
    
            this.state.togglePlayer();
            this.state.displayTurn();
            return;
        }
    
        if (this.isValidMove(row, col)) {
            this.placePiece(row, col, this.state.currentPlayer);
            this.flipPieces(row, col);
            this.removeHighlight();

            this.history.add(row, col, false, this);
    
            // update the number of stones
            this.state.updateScores();
    
            //　check if all stones are placed
            if (this.state.blackScore + this.state.whiteScore == 64) this.endGame();
    
            // update turn messages
            this.state.togglePlayer();
            this.state.displayTurn();

            if (this.checkPass()) return;
    
            // execute ai player's action
            if (this.settings.mode == "cp") {
    
                this.makeComputerMove();
    
                //　check if terminated
                if (this.state.blackScore + this.state.whiteScore == 64) this.endGame();

                this.checkPass();

                this.highlightPossibleCells();
    
            }

            else this.highlightPossibleCells();

        }
    }
    
    // Create a function that retains its arguments using a closure
    createCellClickHandler(row, col) {
        return () => {
            this.cellClickHandler(row, col);
        };
    }

    // AI's move
    makeComputerMove(){

        const aiMove = this.agent.move(this);

        this.placePiece(...aiMove, this.state.currentPlayer);
        this.flipPieces(...aiMove);

        this.history.add(...aiMove, false, this);

        // update the number of stones
        this.state.updateScores();

        // update the turn messages
        this.state.togglePlayer();
        this.state.displayTurn();
    }

    // Highlight places where the current player can place a stone
    highlightPossibleCells(){

        if (this.settings.highlight != "checked") return;

        const possibleCells = this.getPossibleCells();
        possibleCells.forEach((cell) => {
            this.cells[cell[0] * 8 + cell[1]].classList.add("possible");
        });
    }

    // Remove the highlight
    removeHighlight(){
        this.cells.forEach((cell) => {
            cell.classList.remove("possible");
        });
    }

    endGame() {
        if (this.isGameEnd) return;
    
        this.state.displayEnd();
        this.saveGameToDatabase().then(() => {
            // ゲームの保存後、Recent Games の更新を行う
            loadRecentGames(window.nextPage);
        });
    
        this.isGameEnd = true;
    }

    createGameData() {

        let name = "";
        let description = "";
        let player_color = this.settings.color;
        let ai_level = this.settings.level;
        let game_datetime = new Date().toISOString();
        let black_score = this.state.blackScore;
        let white_score = this.state.whiteScore;
        let is_favorite = false;
        let moves = [];

        for (let i=0; i<this.history.history.length; i++){
            let row = this.history.history[i][0];
            if (row == -1) row = 9;
            let col = this.history.history[i][1]
            if (col == -1) col = 9;
            let is_pass = this.history.history[i][2];
            let comment = "";
            moves.push({
                move_number: i+1,
                row: row,
                col: col,
                is_pass: is_pass,
                comment: comment
            });
        }

        return JSON.stringify({
            name: name,
            description: description,
            player_color: player_color,
            ai_level: ai_level,
            game_datetime: game_datetime,
            black_score: black_score,
            white_score: white_score,
            is_favorite: is_favorite,
            moves: moves
        });
    }

    saveGameToDatabase() {
        const gameJsonData = this.createGameData();
    
        // Promise を return する
        return fetch('/save_game/', {
            method: 'POST',
            body: gameJsonData,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.updateGameHistoryCookie(data.game_id);
            }
            console.log(data);
        })
        .catch(error => console.error('Error:', error));
    }

    updateGameHistoryCookie(gameId) {
        const history = getCookie('game_history');
        let gameHistory = history ? JSON.parse(history) : [];

        gameHistory.push(gameId);
        if (gameHistory.length > 10) {
            gameHistory = gameHistory.slice(-10);
        }

        setCookie('game_history', JSON.stringify(gameHistory), 365);
    }
}

// ページロード時にCookieからゲームIDを読み込む
document.addEventListener('DOMContentLoaded', function() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        // ゲーム履歴を使って何かする
        console.log('Game History:', JSON.parse(gameHistory));
    }
});

/*
document.addEventListener('DOMContentLoaded', function() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        let gameIds = JSON.parse(gameHistory);
        gameIds = [...new Set(gameIds)];
        const recentGamesTableBody = document.getElementById('recent-game-table-body');

        const gameDetailsPromises = gameIds.map(gameId => 
            fetch(`/get_game_details/${gameId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Game ID ${gameId} not found`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error:', error);
                    return null;
                })
        );

        Promise.all(gameDetailsPromises).then(games => {
            games = games.filter(game => game !== null);
            games.sort((a, b) => new Date(b.game_datetime) - new Date(a.game_datetime));
            games.forEach(game => {
                const row = document.createElement('tr');
                const gameDate = new Date(game.game_datetime);
                const result = game.black_score > game.white_score 
                               ? (game.player_color === 'black' ? 'Win' : 'Lose')
                               : (game.black_score < game.white_score 
                                  ? (game.player_color === 'white' ? 'Win' : 'Lose')
                                  : 'Draw');
                row.innerHTML = `
                    <td>${gameDate.toLocaleDateString()}</td>
                    <td>${gameDate.toLocaleTimeString()}</td>
                    <td>${game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1)}</td>
                    <td>${result}</td>
                    <td>${game.black_score}</td>
                    <td>${game.white_score}</td>
                    <td>Level ${game.ai_level}</td>
                `;
                recentGamesTableBody.appendChild(row);
            });
        }).catch(error => console.error('Global Error:', error));
    }
});
*/
