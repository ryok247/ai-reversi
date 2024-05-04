"use strict";

import { randomAgent, simpleGreedyAgent, neuralNetAgent, mockAgent, nTurnAlphaBetaLastExausiveAgent} from './agents.js'
import { getCookie, setCookie, getCsrfToken, makeAsync, convertRowColToA1, convertA1ToRowCol } from './utilities.js'
import { sharedState } from './game-shared.js';
import { gameSettings } from './game-settings.js';
import { gameLogic } from './game-logic.js';
import { ReplayAnimator } from './animation.js';
import { constructInputTensor, loadModel } from './tensorflow/tensorflow.js';

import store from './store.js';


// Function to initialize the game
export async function initializeGame(historyElement){
    const boardElement = document.querySelector(".board");
    const turnElement = document.getElementById("turn");

    const progressElement = document.getElementById('progress');
    const animatedBoardElement = document.querySelector(".board.animated");

    sharedState.settings = new gameSettings("mode", "color", "level", "highlight", "aiscore");
    sharedState.logic = new gameLogic();
    sharedState.animator = new ReplayAnimator(sharedState.logic, animatedBoardElement, progressElement);
    sharedState.board = await createAndInitializeBoard(sharedState.logic, sharedState.settings, boardElement, turnElement, historyElement);

    sharedState.board.updateScores();
    sharedState.board.displayTurn();
}

async function initializeAgent(settings) {

    // tensorflow model for the opponent player and evaluator as well
    const model = await loadModel();
    let agent;

    if (sharedState.debug) agent = new mockAgent(sharedState.debugMoves);
    else {
        if (settings.level === "1") agent = new randomAgent();
        else if (settings.level === "2") agent = new simpleGreedyAgent();
        else if (settings.level === "3") agent =  new nTurnAlphaBetaLastExausiveAgent(6,10);
        else if (settings.level === "4") agent =  new neuralNetAgent(model, true);
        else console.error("Invalid level");
    }

    return [agent, model];
}

export class boardInfo{
    constructor(logic, settings, boardElement, turnElement, historyElement){

        this.logic = logic;
        this.settings = settings;
        this.boardElement = boardElement;
        this.turnElement = turnElement;

        this.historyElement = historyElement;

        this.isGameEnd = false;
    }

    async initialize(aiFirst) {

        let tableBodyAll = document.querySelectorAll(".history-table tbody");
        tableBodyAll.forEach((tableBody) => {
            tableBody.innerHTML = "";
        });

        // 非同期処理をここで実行
        [this.agent, this.model] = await initializeAgent(this.settings);

        // Make the AI's move function asynchronous since it may take a long time
        this.asyncMove = makeAsync(this.agent.move);

        this.lastMoveTime = -1;
        this.timeHistory = [-1];

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

                if (this.logic.board[row][col] !== -1){
                    const newPiece = document.createElement("div");
                    newPiece.classList.add("piece", (this.logic.board[row][col] === 0 ? "black": "white"));
                    cell.appendChild(newPiece);
                }

                this.cells.push(cell);
    
                // Add a click event
                cell.addEventListener("click", this.createCellClickHandler(row, col));
            }
        }

        if (sharedState.settings.mode === "cp" && sharedState.settings.color === "white") await this.makeComputerMove();

        if (sharedState.debug) this.debugHighlight();
        else {
            this.highlightPossibleCells();
            this.highlightAIScore()
        }

    }

    // Place a stone
    placePiece(row, col) {

        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", (this.logic.currentPlayer === 0 ? "black": "white"));
        this.cells[row * 8 + col].appendChild(newPiece);

        let flip = this.logic.placePiece(row, col);
        flip.forEach(([x, y]) => {
            this.cells[x * 8 + y].childNodes[0].classList.toggle("black");
            this.cells[x * 8 + y].childNodes[0].classList.toggle("white");
        });
    }

    displayTurn(){
        this.turnElement.textContent = (this.logic.currentPlayer === 0 ? "Black" : "White");
    }

    // displays a message if the game is terminated
    displayEnd() {
        const language = store.getState().language.language;
        let resultMessage = '';
        if (this.logic.score[0] > this.logic.score[1]) resultMessage = (language==="en" ? 'Black Wins!' : '黒の勝ち！');
        else if (this.logic.score[0] < this.logic.score[1]) resultMessage = (language==="en" ? 'White Wins!' : '白の勝ち！');
        else resultMessage = (language==="en" ? 'Draw!' : '引き分け！');
    
        document.getElementById('game-end-modal').style.display = 'block';
        document.getElementById('game-result').textContent = resultMessage;
    
        // Change the display according to the login status
        // Commented out for now because it might make users confused
        // When this is uncommented, make sure to uncomment in main.js as well
        /*
        if (isUserLoggedIn()) {
            document.getElementById('game-title-input').style.display = 'block';
            document.getElementById('game-description-input').style.display = 'block';
            document.getElementById('login-signup-message').style.display = 'none';
        } else {
            document.getElementById('game-title-input').style.display = 'none';
            document.getElementById('game-description-input').style.display = 'none';
            document.getElementById('login-signup-message').style.display = 'block';
        }
        */

        document.getElementById('game-title-input').style.display = 'none';
        document.getElementById('game-description-input').style.display = 'none';
        if (!isUserLoggedIn()) document.getElementById('login-signup-message').style.display = 'block';
    }
    
    updateScores() {
        document.getElementById("black-score").textContent = this.logic.score[0];
        document.getElementById("white-score").textContent = this.logic.score[1];
    }

    async cellClickHandler(row, col){

        const endTime = Date.now();

        let moveDuration = -1;
        if (this.lastMoveTime !== -1) moveDuration = endTime - this.lastMoveTime; // Compute the elapsed time

        this.lastMoveTime = endTime;

        const possibleCells = this.logic.getPossibleMoves();
    
        if (possibleCells.length === 0){

            addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, -1, "history-table");
            this.timeHistory.push(-1);

            let twoPass = this.logic.pass();

            if (twoPass) {
                this.endGame();
                return;
            }

            this.displayTurn();

            return;
        }
    
        if (this.logic.isValidMove(row, col)) {
            addToHistoryTable(sharedState.animator, row, col, this.logic.history.length, moveDuration, "history-table");
            this.timeHistory.push(moveDuration);

            //this.placePiece(row, col);

            if (sharedState.debug) this.removeDebugHighlight();
            else {
                this.removeHighlight();
                this.removeAIScore();
            }

            this.placePiece(row, col);
    
            // update the number of stones
            this.updateScores();
            
            // check if all stones are placed
            if (this.logic.isFull()) {
                this.endGame();
                return;
            }
    
            // update turn messages
            this.displayTurn();

            let possibleCells = this.logic.getPossibleMoves();

            if (possibleCells.length === 0){

                addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, -1, "history-table");
                this.timeHistory.push(-1);

                let isTwoPass = this.logic.pass();

                this.displayTurn();
    
                // two passses -> end the game
                if (isTwoPass) {
                    this.endGame();
                    return;
                }
    
                if (sharedState.debug) this.debugHighlight();
                else {
                    this.highlightPossibleCells();
                    this.highlightAIScore();
                }
    
                return;
            }

            // Before executing other processes, end the current event loop cycle
            // This allows the UI to be updated immediately
            await new Promise(resolve => setTimeout(resolve, 0));
    
            // execute ai player's action
            if (this.settings.mode === "cp") {
    
                await this.makeComputerMove();
                
                // check if terminated
                if (this.logic.isFull()) {
                    this.endGame();
                    return;
                }

                let possibleCells = this.logic.getPossibleMoves();

                while (possibleCells.length === 0){
    
                    addToHistoryTable(sharedState.animator, -1, -1, this.logic.history.length, -1, "history-table");
                    this.timeHistory.push(-1);

                    let isTwoPass = this.logic.pass();
    
                    this.displayTurn();
    
                    if (isTwoPass) {
                        this.endGame();
                        return;
                    }

                    await this.makeComputerMove();
                    
                    // check if terminated
                    if (this.logic.isFull()) {
                        this.endGame();
                        return;
                    }

                    possibleCells = this.logic.getPossibleMoves();
                }

                if (sharedState.debug) this.debugHighlight()
                else {
                    this.highlightPossibleCells();
                    this.highlightAIScore();
                }
            }

            if (sharedState.debug) this.debugHighlight()
            else {
                this.highlightPossibleCells();
                this.highlightAIScore();
            }

            this.lastMoveTime = Date.now();
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

        this.lastMoveTime = this.lastMoveTime !== -1 ? Date.now() : -1;

        //const aiMove = await this.agent.move(this.logic);
        const aiMove = await this.asyncMove.call(this.agent, this.logic);

        const endTime = Date.now();
        const moveDuration = this.lastMoveTime !== -1 ? endTime - this.lastMoveTime: -1; // Compute the elapsed time

        this.lastMoveTime = Date.now();

        addToHistoryTable(sharedState.animator, ...aiMove, this.logic.history.length, moveDuration, "history-table");
        this.timeHistory.push(moveDuration);

        this.placePiece(...aiMove);

        // update the number of stones
        this.updateScores();

        // update the turn messages
        this.displayTurn();
    }

    updateCellColor(cellElement, score) {
        // スコアに基づいて色を計算する（0が最悪で1が最良）
        const red = score < 0.5 ? 0 : Math.round((score - 0.5) * 2 * 255); // スコアが0.5以上で赤色が増加
        const green = score < 0.5 ? Math.round(score * 2 * 255) : Math.round((1.0 - score) * 2 * 255); // 中間の値で緑色が最大
        const blue = score < 0.5 ? Math.round((0.5 - score) * 2 * 255) : 0; // スコアが0.5以下で青色が増加
    
        // 背景色のRGB値をCSS変数に設定
        cellElement.style.setProperty('--score-color', `rgb(${red}, ${green}, ${blue})`);
    
        // テキストの色を設定（背景が暗い場合は白、明るい場合は黒）
        const textColor = (red * 0.299 + green * 0.587 + blue * 0.114) > 186 ? 'black' : 'white';
        cellElement.style.setProperty('--text-color', textColor);
    }    

    // Highlight places where the current player can place a stone
    highlightPossibleCells(){

        if (this.settings.highlight !== "checked") return;

        const possibleCells = this.logic.getPossibleMoves();
        possibleCells.forEach((cell) => {
            this.cells[cell[0] * 8 + cell[1]].classList.add("possible");
        });
    }

    debugHighlight(){
        const currentTrunIndex = sharedState.logic.history.length - 1;
        const [row, col] = convertA1ToRowCol(sharedState.debugMoves[currentTrunIndex]);
        this.cells[row * 8 + col].classList.add("debug");
    }

    highlightAIScore(){

        if (this.settings.aiscore !== "checked") return;

        const player = (this.settings.color === "black" ? 0 : 1);

        const inputTensor = constructInputTensor(this.logic, player);
        const vals = this.model.predict(inputTensor).arraySync();
        const probs = window.tf.softmax(vals).arraySync();

        const possibleCells = this.logic.getPossibleMoves();
        possibleCells.forEach(([row, col]) => {
            const cellElement = this.cells[row * 8 + col];
            cellElement.classList.add("aiscore");
            const p = probs[0][row*8 + col];
            this.updateCellColor(cellElement, p);
            cellElement.textContent = p.toFixed(3);
        });

    }

    // Remove the highlight
    removeHighlight(){

        this.cells.forEach((cell) => {
            cell.classList.remove("possible");
        });
    }

    removeDebugHighlight(){
        this.cells.forEach((cell) => {
            cell.classList.remove("debug");
        });
    }

    removeAIScore(){
        this.cells.forEach((cell) => {
            if (!cell.classList.contains("aiscore")) return;

            cell.textContent = "";
            cell.style.removeProperty('--score-color');
            cell.classList.remove("aiscore");
        });
    }

    endGame() {
        if (this.isGameEnd) return;
    
        this.displayEnd();
        this.saveGameToDatabase().then(() => {
            // ゲームの保存後、Recent Games の更新を行う
            if (isUserLoggedIn()) loadGames("recent", sharedState.nextPage);
            //else loadRecentGamesFromCookie();
        });
    
        this.isGameEnd = true;
    }

    createGameData(title) {

        let description = "";
        let player_color = this.settings.color;
        let ai_level = this.settings.level;
        let game_datetime = new Date().toISOString();
        let [black_score, white_score] = this.logic.score;
        let is_favorite = false;
        let moves = [];

        for (let i=0; i<this.logic.history.length; i++){
            let row = this.logic.history[i][0];
            if (row === -1) row = 9;
            let col = this.logic.history[i][1]
            if (col === -1) col = 9;
            let is_pass = (row === 9 && col === 9);
            let comment = "";
            moves.push({
                move_number: i+1,
                row: row,
                col: col,
                is_pass: is_pass,
                duration: this.timeHistory[i],
                comment: comment,
            });
        }

        return JSON.stringify({
            name: title,
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
        const title = sharedState.userInputTitle || "Untitled";
        const gameJsonData = this.createGameData(title);
    
        // Send request to the backend
        return fetch('/api/save_game/', {
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

// インスタンス化と初期化のための非同期関数
async function createAndInitializeBoard(logic, settings, boardElement, turnElement, historyElement) {
    const board = new boardInfo(logic, settings, boardElement, turnElement, historyElement);
    await board.initialize();
    return board;
}

export function addToHistoryTable(animator, row, col, turnNumber, duration, historyTableClass) {

    const language = store.getState().language.language;

    const tableBodyAll = document.querySelectorAll(`.${historyTableClass} tbody`);

    tableBodyAll.forEach((tableBody) => {

        // Create a new row
        let newRow = tableBody.insertRow(0);

        // Create cells for the new row
        let cell1 = newRow.insertCell(0);
        let cell2 = newRow.insertCell(1);
        let cell3 = newRow.insertCell(2);
        let cell4 = newRow.insertCell(3);

        // Set content for each cell (you can modify this as needed)

        const black = language==="en" ? "Black" : "黒";
        const white = language==="en" ? "White" : "白";
        const pass = language==="en" ? " Pass" : " パス";

        cell1.textContent = turnNumber;
        cell2.textContent = animator.gameLogic.currentPlayer === 0 ? black : white;
        cell3.textContent = (row === -1 && col === -1) ? pass : convertRowColToA1(row, col);
        cell4.textContent = duration !== -1 ? (duration / 1000).toFixed(3) : "-";

        if (tableBody.id === "replay-table-body") {
            newRow.addEventListener("click", (event)=>{
                animator.fromHistoryRowDisplayBoard(event);
            });
        }
    });
}

// Function to load games (recent or favorite) and populate the table
export function loadGames(type = "recent", page = 1) {
    fetch(`/api/${type === "recent" ? "user" : "favorite"}_games/?page=${page}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }}).then(response => response.json())
        .then(data => {
            const gamesList = document.getElementById(`${type === "recent" ? "recent" : "favorite"}-game-table-body`);

            // Check if user is logged in
            const loggedIn = isUserLoggedIn();
            const displayStyle = loggedIn ? 'table-cell' : 'none';

            for (const id of ['favorite-header', 'title-header', 'edit-header']){
                const element = document.getElementById(id);
                if (element) element.style.display = displayStyle;
            }

            gamesList.innerHTML = '';

            data.games.forEach(game => {
                const row = createRowFromDatabase(game, loggedIn);
                gamesList.appendChild(row);
            });

            if (data.has_next) {
                if (type === "recent") {
                    sharedState.nextPage = sharedState.currentPage + 1;
                } else {
                    // Handle the next page for favorite games
                }
            }

            // Update pagination
            if (type === 'recent') {
                sharedState.currentPage = page;
                createPagination('recent-games-pagination', page, data.total_pages, 'recent');
            } else if (type === 'favorite') {
                sharedState.favoriteCurrentPage = page;
                createPagination('favorite-games-pagination', page, data.total_pages, 'favorite');
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
            fetch(`/api/get_game_details/${gameId}`)
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
export function createRowFromDatabase(game, loggedIn) {

    const language = store.getState().language.language;

    const row = document.createElement('tr');
    row.setAttribute('data-game-id', game.id);

    // Favorite column
    const favoriteColumn = document.createElement('td');
    favoriteColumn.className = 'favorite-column center-align';
    favoriteColumn.setAttribute('data-game-id', game.id);
    favoriteColumn.style.display = loggedIn ? 'table-cell' : 'none';

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
    replayColumn.className = 'center-align';
    const replayIcon = document.createElement('i');
    replayIcon.classList.add('fa', 'fa-play-circle', 'replay-icon');
    replayIcon.style.cursor = 'pointer';
    replayIcon.addEventListener('click', () => startReplay(game.id));
    replayColumn.appendChild(replayIcon);
    row.appendChild(replayColumn);

    // Name column
    const nameColumn = document.createElement('td');
    nameColumn.textContent = game.name;
    nameColumn.style.display = loggedIn ? 'table-cell' : 'none';
    row.appendChild(nameColumn);

    // Edit button column
    const editColumn = document.createElement('td');
    editColumn.style.display = loggedIn ? 'table-cell' : 'none';
    if (isUserLoggedIn()) {
        const editIcon = document.createElement('i');
        editIcon.className = 'fa fa-edit edit-icon';
        editIcon.style.cursor = 'pointer';
        editIcon.addEventListener('click', () => {
            // 新しい入力要素と保存ボタンを作成
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'game-name-input';
            inputElement.value = nameColumn.textContent;

            const saveButton = document.createElement('button');
            saveButton.textContent = language==="en" ? 'Save' : '保存';
            saveButton.className = 'save-button btn-sm btn-primary';

            // enableEditing 関数の修正されたバージョンを呼び出す
            enableEditing(game.id, nameColumn, inputElement, saveButton);
        });

        editColumn.appendChild(editIcon);
    }
    row.appendChild(editColumn);

    // Other columns
    const dateColumn = document.createElement('td');
    dateColumn.textContent = new Date(game.game_datetime).toLocaleDateString();
    row.appendChild(dateColumn);

    const timeColumn = document.createElement('td');
    timeColumn.textContent = new Date(game.game_datetime).toLocaleTimeString();
    row.appendChild(timeColumn);

    const colorColumn = document.createElement('td');
    const black = language==="en" ? 'Black' : '黒';
    const white = language==="en" ? 'White' : '白';
    colorColumn.textContent = game.player_color === "black" ? black : white;
    row.appendChild(colorColumn);

    const resultColumn = document.createElement('td');
    const win = language==="en" ? 'Win' : '勝ち';
    const lose = language==="en" ? 'Lose' : '負け';
    const draw = language==="en" ? 'Draw' : '引き分け';

    if (game.player_color === "black"){
        resultColumn.textContent = game.black_score > game.white_score ? win : game.black_score < game.white_score ? lose : draw;
    } else {
        resultColumn.textContent = game.black_score > game.white_score ? lose : game.black_score < game.white_score ? win : draw;
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

    const durationColumn = document.createElement('td');
    durationColumn.textContent = (game.total_user_duration / 1000).toFixed(3);
    row.appendChild(durationColumn);

    return row;
}

// Function to check if the user is logged in
export function isUserLoggedIn() {
    //return document.getElementById('user-status').innerText === 'Logged In';
    return store.getState().auth.isAuthenticated;
}

// Function to update game records for the user
export function updateGameRecordsWithUser() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        const gameIds = JSON.parse(gameHistory);

        // Send request to the backend
        fetch('/api/update_game_records/', {
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
    fetch(`/api/toggle_favorite/${gameId}/`, {
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

// Enable editing for the given game
export function enableEditing(gameId, nameColumn, inputElement, saveButton) {
    // Hide the name column
    nameColumn.style.display = 'none';

    // Insert the input element and save button before the name column
    nameColumn.parentNode.insertBefore(inputElement, nameColumn);
    nameColumn.parentNode.insertBefore(saveButton, nameColumn.nextSibling);

    // Save the new name to the database
    saveButton.addEventListener('click', () => {
        const newName = inputElement.value;

        if (newName.length > sharedState.maxTitleLength) {
            alert(`The title of the game cannot be longer than ${sharedState.maxTitleLength} characters.`)
            return;
        }

        updateGameName(gameId, newName, nameColumn);

        // Display the name column again
        nameColumn.textContent = newName;
        inputElement.remove();
        saveButton.remove();
        nameColumn.style.display = 'block';
    });
}

// Update game name in both Recent and Favorite Games
export function updateGameName(gameId, newName, nameColumn, isFavorite) {
    fetch(`/api/update_game_name/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name: newName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Update name in both tables
            const nameCells = document.querySelectorAll(`tr[data-game-id="${gameId}"] td:nth-child(3)`); // Assuming name is the 3rd column
            nameCells.forEach(cell => cell.textContent = newName || '');

            // Optionally, switch back from input to text
            nameColumn.textContent = newName || '';
        } else {
            console.error('Error updating name:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Generate pagination buttons
function createPagination(containerId, currentPage, totalPages, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.classList.add('d-flex', 'justify-content-center', 'my-3');

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('btn-sm', 'mx-1');

        if (i === currentPage) {
            // Apply btn-primary class to the button of the current page
            button.classList.add('btn-primary');
        } else {
            // Apply btn-outline-primary class to the buttons of other pages
            button.classList.add('btn-outline-primary');
        }

        button.onclick = () => loadGames(type, i);
        container.appendChild(button);
    }
}
