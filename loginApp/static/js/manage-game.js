"use strict";

import { randomAgent, simpleGreedyAgent} from './agents.js'
import { getCookie, setCookie, getCsrfToken } from './utilities.js'
import { loadGames } from './main.js';
import { sharedState } from './game-shared.js';
import { ReplayAnimator } from './animation.js';

export class boardInfo{
    constructor(logic, settings, boardElement, turnElement, historyElement){

        this.logic = logic;
        this.settings = settings;
        this.boardElement = boardElement;
        this.turnElement = turnElement;

        this.historyElement = historyElement;

        let tableBodyAll = document.querySelectorAll(".history-table tbody");

        tableBodyAll.forEach((tableBody) => {
            tableBody.innerHTML = "";
        });

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

                if (this.logic.board[row][col] != -1){
                    const newPiece = document.createElement("div");
                    newPiece.classList.add("piece", (this.logic.board[row][col] == 0 ? "black": "white"));
                    cell.appendChild(newPiece);
                }

                this.cells.push(cell);
    
                // Add a click event
                cell.addEventListener("click", this.createCellClickHandler(row, col));
            }
        }

        if (this.settings.mode == "cp" && this.settings.color == "black") this.highlightPossibleCells();
        else if (this.settings.mode == "manual") this.highlightPossibleCells();
    
    }

    // Place a stone
    placePiece(row, col) {

        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", (this.logic.currentPlayer == 0 ? "black": "white"));
        this.cells[row * 8 + col].appendChild(newPiece);

        let flip = this.logic.placePiece(row, col);
        flip.forEach(([x, y]) => {
            this.cells[x * 8 + y].childNodes[0].classList.toggle("black");
            this.cells[x * 8 + y].childNodes[0].classList.toggle("white");
        });
    }

    displayTurn(){
        this.turnElement.textContent = (this.logic.currentPlayer == 0 ? "black" : "white");
    }

    // displays a message if the game is terminated
    displayEnd() {
        let resultMessage = '';
        if (this.logic.score[0] > this.logic.score[1]) resultMessage = 'Black Wins!';
        else if (this.logic.score[0] < this.logic.score[1]) resultMessage = 'White Wins!';
        else resultMessage = 'Draw!';

        alert(`${resultMessage}\nBlack: ${this.logic.score[0]}\nWhite: ${this.logic.score[1]}`);
    }

    updateScores() {
        document.getElementById("black-score").textContent = this.logic.score[0];
        document.getElementById("white-score").textContent = this.logic.score[1];
    }

    cellClickHandler(row, col){

        //const possibleCells = this.getPossibleCells();

        const possibleCells = this.logic.getPossibleMoves();
    
        if (possibleCells.length == 0){

            this.addToHistoryTable(-1, -1, this.logic.history.length);
            let twoPass = this.logic.pass()

            if (twoPass) {
                this.endGame();
                return;
            }

            this.displayTurn();
            return;
        }
    
        if (this.logic.isValidMove(row, col)) {
            this.addToHistoryTable(row, col, this.logic.history.length);
            this.placePiece(row, col);
            this.removeHighlight();
    
            // update the number of stones
            this.updateScores();
    
            //　check if all stones are placed
            if (this.logic.isFull()) {
                this.endGame();
                return;
            }
    
            // update turn messages
            this.displayTurn();

            let possibleCells = this.logic.getPossibleMoves();

            if (possibleCells.length == 0){

                this.addToHistoryTable(-1, -1, this.logic.history.length);
                let isTwoPass = this.logic.pass();

                this.displayTurn();
    
                // two passses -> end the game
                if (isTwoPass) {
                    this.endGame();
                    return;
                }
    
                this.highlightPossibleCells();
    
                return;
            }
    
            // execute ai player's action
            if (this.settings.mode == "cp") {
    
                this.makeComputerMove();
    
                //　check if terminated
                if (this.logic.isFull()) {
                    this.endGame();
                    return;
                }

                let possibleCells = this.logic.getPossibleMoves();

                if (possibleCells.length == 0){
    
                    this.addToHistoryTable(-1, -1, this.logic.history.length);
                    let isTwoPass = this.logic.pass();
    
                    this.displayTurn();
    
                    if (isTwoPass) {
                        this.endGame();
                        return;
                    }
                }

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
        this.addToHistoryTable(...aiMove, this.logic.history.length);
        this.placePiece(...aiMove);

        // update the number of stones
        this.updateScores();

        // update the turn messages
        this.displayTurn();
    }

    // Highlight places where the current player can place a stone
    highlightPossibleCells(){

        if (this.settings.highlight != "checked") return;

        //const possibleCells = this.getPossibleCells();
        const possibleCells = this.logic.getPossibleMoves();
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
    
        this.displayEnd();
        this.saveGameToDatabase().then(() => {
            // ゲームの保存後、Recent Games の更新を行う
            loadGames("recent", sharedState.nextPage);
        });
    
        this.isGameEnd = true;
    }

    addToHistoryTable(row, col, turnNumber) {
    
        const toReversiCol = {
            0: "A",
            1: "B",
            2: "C",
            3: "D",
            4: "E",
            5: "F",
            6: "G",
            7: "H"
        }

        this.addRowToHistory(
            this.logic.currentPlayer == 0 ? "Black" : "White",
            turnNumber,
            (row == -1 && col == -1) ? " Pass" : ` ${toReversiCol[col]}${row + 1} `
            );
    }

    addRowToHistory(color, turnNumber, position) {
        // Get the table body
        let tableBodyAll = document.querySelectorAll(".history-table tbody");

        tableBodyAll.forEach((tableBody) => {

            // Create a new row
            let newRow = tableBody.insertRow(0);

            // Create cells for the new row
            let cell1 = newRow.insertCell(0);
            let cell2 = newRow.insertCell(1);
            let cell3 = newRow.insertCell(2);

            // Set content for each cell (you can modify this as needed)
            cell1.textContent = turnNumber;
            cell2.textContent = color;
            cell3.textContent = position;

            if (tableBody.id == "replay-table-body") {
                newRow.addEventListener("click", (event)=>{
                    sharedState.animator.fromHistoryRowDisplayBoard(event);
                });
            }
        });
    }

    createGameData() {

        let name = "";
        let description = "";
        let player_color = this.settings.color;
        let ai_level = this.settings.level;
        let game_datetime = new Date().toISOString();
        let [black_score, white_score] = this.logic.score;
        let is_favorite = false;
        let moves = [];

        for (let i=0; i<this.logic.history.length; i++){
            let row = this.logic.history[i][0];
            if (row == -1) row = 9;
            let col = this.logic.history[i][1]
            if (col == -1) col = 9;
            let is_pass = (row == 9 && col == 9);
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
