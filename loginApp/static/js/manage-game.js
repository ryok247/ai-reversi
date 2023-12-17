"use strict";

import { randomAgent, simpleGreedyAgent, nTurnMinimaxLastExausiveAgent} from './agents.js'
import { getCookie, setCookie, getCsrfToken, makeAsync } from './utilities.js'
import { sharedState } from './game-shared.js';
import { gameSettings } from './game-settings.js';
import { gameLogic } from './game-logic.js';
import { ReplayAnimator } from './animation.js';

// Function to initialize the game
export function initializeGame(historyElement){
    const boardElement = document.querySelector(".board");
    const turnElement = document.getElementById("turn");

    const progressElement = document.getElementById('progress');
    const animatedBoardElement = document.querySelector(".board.animated");

    sharedState.settings = new gameSettings("mode", "color", "level", "highlight");
    sharedState.logic = new gameLogic();
    sharedState.animator = new ReplayAnimator(sharedState.logic, animatedBoardElement, progressElement);
    sharedState.board = new boardInfo(sharedState.logic, sharedState.settings, boardElement, turnElement, historyElement);
}

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
        else if (this.settings.level == 3) this.agent = new nTurnMinimaxLastExausiveAgent(6,10);
        else console.assert(false);

        // Make the AI's move function asynchronous since it may take a long time
        this.asyncMove = makeAsync(this.agent.move);

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

    async cellClickHandler(row, col){

        //const possibleCells = this.getPossibleCells();

        const possibleCells = this.logic.getPossibleMoves();
    
        if (possibleCells.length == 0){

            addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, "history-table");
            let twoPass = this.logic.pass()

            if (twoPass) {
                this.endGame();
                return;
            }

            this.displayTurn();
            return;
        }
    
        if (this.logic.isValidMove(row, col)) {
            addToHistoryTable(sharedState.animator, row, col, this.logic.history.length, "history-table");
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

                addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, "history-table");
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

            // Before executing other processes, end the current event loop cycle
            // This allows the UI to be updated immediately
            await new Promise(resolve => setTimeout(resolve, 0));
    
            // execute ai player's action
            if (this.settings.mode == "cp") {
    
                await this.makeComputerMove();
    
                //　check if terminated
                if (this.logic.isFull()) {
                    this.endGame();
                    return;
                }

                let possibleCells = this.logic.getPossibleMoves();

                if (possibleCells.length == 0){
    
                    addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, "history-table");
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
    async makeComputerMove(){

        //const aiMove = await this.agent.move(this.logic);
        const aiMove = await this.asyncMove.call(this.agent, this.logic);
        addToHistoryTable(sharedState.animator, ...aiMove, this.logic.history.length, "history-table");
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
    
        // Send request to the backend
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

export function addToHistoryTable(animator, row, col, turnNumber, historyTableClass) {
    
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

    const tableBodyAll = document.querySelectorAll(`.${historyTableClass} tbody`);

    tableBodyAll.forEach((tableBody) => {

        // Create a new row
        let newRow = tableBody.insertRow(0);

        // Create cells for the new row
        let cell1 = newRow.insertCell(0);
        let cell2 = newRow.insertCell(1);
        let cell3 = newRow.insertCell(2);

        // Set content for each cell (you can modify this as needed)
        cell1.textContent = turnNumber;
        cell2.textContent = animator.gameLogic.currentPlayer == 0 ? "Black" : "White";
        cell3.textContent = (row == -1 && col == -1) ? " Pass" : ` ${toReversiCol[col]}${row + 1} `;

        if (tableBody.id == "replay-table-body") {
            newRow.addEventListener("click", (event)=>{
                animator.fromHistoryRowDisplayBoard(event);
            });
        }
    });
}

// Function to load games (recent or favorite) and populate the table
export function loadGames(type = "recent", page = 1) {
    fetch(`/${type == "recent" ? "user" : "favorite"}_games/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const gamesList = document.getElementById(`${type == "recent" ? "recent" : "favorite"}-game-table-body`);

            // Check if user is logged in
            if (type == "recent" && isUserLoggedIn()) {
                document.getElementById('favorite-header').style.display = 'table-cell';
            }

            gamesList.innerHTML = '';

            data.games.forEach(game => {
                gamesList.appendChild(createRowFromDatabase(game));
            });

            if (type == "recent") {
                sharedState.currentPage = page;
            } else {
                sharedState.favoriteCurrentPage = page;
            }

            // Manage display of buttons
            document.getElementById(`load-prev-${type == "recent" ? "" : "favorite-"}games`).style.display = page > 1 ? 'block' : 'none';
            document.getElementById(`load-more-${type == "recent" ? "" : "favorite-"}games`).style.display = data.has_next ? 'block' : 'none';

            if (data.has_next) {
                if (type == "recent") {
                    sharedState.nextPage = sharedState.currentPage + 1;
                } else {
                    // Handle the next page for favorite games
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to load recent games from the cookie
export function loadRecentGamesFromCookie() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        let gameIds = JSON.parse(gameHistory);
        gameIds = [...new Set(gameIds)];
        const recentGamesTableBody = document.getElementById('recent-game-table-body');

        // Fetch and process game details
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
                recentGamesTableBody.appendChild(createRowFromDatabase(game));
            });
        }).catch(error => console.error('Global Error:', error));
    }
}

// Function to create a table row from game data
export function createRowFromDatabase(game) {
    const row = document.createElement('tr');
    row.setAttribute('data-game-id', game.id);

    // Favorite column
    const favoriteColumn = document.createElement('td');
    favoriteColumn.className = 'favorite-column';
    favoriteColumn.setAttribute('data-game-id', game.id);

    if (isUserLoggedIn()) {
        const favoriteIcon = document.createElement('i');
        favoriteIcon.className = `fa fa-star ${game.is_favorite ? 'favorite' : ''}`;
        favoriteIcon.style.color = game.is_favorite ? 'orange' : 'grey';
        favoriteIcon.style.cursor = 'pointer';
        favoriteIcon.addEventListener('click', () => toggleFavorite(game.id));
        favoriteColumn.appendChild(favoriteIcon);
    }
    row.appendChild(favoriteColumn);

    // Replay column
    const replayColumn = document.createElement('td');
    const replayIcon = document.createElement('i');
    replayIcon.classList.add('fa', 'fa-play-circle', 'replay-icon');
    replayIcon.style.cursor = 'pointer';
    replayIcon.addEventListener('click', () => startReplay(game.id));
    replayColumn.appendChild(replayIcon);
    row.appendChild(replayColumn);

    // Other columns
    const dateColumn = document.createElement('td');
    dateColumn.textContent = new Date(game.game_datetime).toLocaleDateString();
    row.appendChild(dateColumn);

    const timeColumn = document.createElement('td');
    timeColumn.textContent = new Date(game.game_datetime).toLocaleTimeString();
    row.appendChild(timeColumn);

    const colorColumn = document.createElement('td');
    colorColumn.textContent = game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1);
    row.appendChild(colorColumn);

    const resultColumn = document.createElement('td');
    if (game.player_color == "black"){
        resultColumn.textContent = game.black_score > game.white_score ? 'Win' : game.black_score < game.white_score ? 'Lose' : 'Draw';
    } else {
        resultColumn.textContent = game.black_score > game.white_score ? 'Lose' : game.black_score < game.white_score ? 'Win' : 'Draw';
    }
    row.appendChild(resultColumn);

    const blackScoreColumn = document.createElement('td');
    blackScoreColumn.textContent = game.black_score;
    row.appendChild(blackScoreColumn);

    const whiteScoreColumn = document.createElement('td');
    whiteScoreColumn.textContent = game.white_score;
    row.appendChild(whiteScoreColumn);

    const levelColumn = document.createElement('td');
    levelColumn.textContent = 'Level ' + game.ai_level;
    row.appendChild(levelColumn);

    return row;
}

// Function to check if the user is logged in
export function isUserLoggedIn() {
    return document.getElementById('user-status').innerText === 'Logged In';
}

// Function to update game records for the user
export function updateGameRecordsWithUser() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        const gameIds = JSON.parse(gameHistory);

        // Send request to the backend
        fetch('/update_game_records/', {
            method: 'POST',
            body: JSON.stringify({game_ids: gameIds}),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
}

// Function to toggle the favorite status of a game
export function toggleFavorite(gameId) {
    fetch(`/toggle_favorite/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const favoriteCells = document.querySelectorAll(`.favorite-column[data-game-id="${gameId}"]`);
            favoriteCells.forEach(cell => {
                // Delete the old icon
                cell.innerHTML = '';

                // Create a new icon
                const newFavoriteIcon = document.createElement('i');
                newFavoriteIcon.className = `fa fa-star`;
                newFavoriteIcon.style.color = data.is_favorite ? 'orange' : 'grey';
                newFavoriteIcon.style.cursor = 'pointer';
                newFavoriteIcon.addEventListener('click', () => toggleFavorite(gameId));

                // Add the new icon to the cell
                cell.appendChild(newFavoriteIcon);

                // Update the favorite games table
                const isFavorite = data.is_favorite ? 'Yes' : 'No';
                updateFavoriteGamesTable(gameId, isFavorite);
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to update the favorite games table
export function updateFavoriteGamesTable(gameId, isFavorite) {
    const favoriteGamesTableBody = document.getElementById('favorite-game-table-body');
    const rowInFavoriteGames = favoriteGamesTableBody.querySelector(`tr[data-game-id="${gameId}"]`);
    const rowInRecentGames = document.querySelector(`#recent-game-table-body tr[data-game-id="${gameId}"]`);

    if (!rowInRecentGames) {
        console.error('No corresponding row found in Recent Games');
        return;
    }

    if (isFavorite === 'Yes') {
        if (!rowInFavoriteGames) {
            const newRow = rowInRecentGames.cloneNode(true);

            // Add event listener to the replay icon in the new row
            const replayIcon = newRow.querySelector('.replay-icon');
            replayIcon.addEventListener('click', () => startReplay(gameId));

            // Add event listener to the favorite icon in the new row
            const newFavoriteCell = newRow.querySelector('.favorite-column');
            newFavoriteCell.addEventListener('click', function() {
                toggleFavorite(gameId);
            });

            favoriteGamesTableBody.appendChild(newRow);
        }
    } else {
        if (rowInFavoriteGames) {
            favoriteGamesTableBody.removeChild(rowInFavoriteGames);
        }
    }
}

export function startReplay(gameId) {
    // Open a new window for the replay
    window.open(`/past_replay/${gameId}/`, '_blank');
}
