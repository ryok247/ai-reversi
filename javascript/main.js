"use strict";

import { getRandomInt } from './utilities.js';

const boardElement = document.querySelector(".board");
const turnElement = document.getElementById("turn");
const confirmedBtnElement = document.getElementById("confirmed-btn");
const historyElement = document.getElementById("history");
let state, settings, board, history;

class gameState{
    constructor(){
        this.turnCounter = 0;
        this.blackScore = 2;
        this.whiteScore = 2;
        this.currentPlayer = "black";
    }

    changeScores(blackChange, whiteChange){
        this.blackScore += blackChange;
        this.whiteScore += whiteChange;
    }

    updateScores() {
        document.getElementById("black-score").textContent = this.blackScore;
        document.getElementById("white-score").textContent = this.whiteScore;
    }

    counterIncrement(){
        this.turnCounter++;
    }

    togglePlayer(){
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    }

    // displays a message if the game is terminated
    displayEnd() {
        let resultMessage = '';
        if (this.blackScore > this.whiteScore) resultMessage = 'Black Wins!';
        else if (this.blackScore < this.whiteScore) resultMessage = 'White Wins!';
        else resultMessage = 'Draw!';

        alert(`${resultMessage}\nBlack: ${this.blackScore}\nWhite: ${this.whiteScore}`);
    }
}

class gameSettings{
    constructor(){
        this.mode = this.getRadioValue("mode");
        this.color = this.getRadioValue("color");
        this.level = this.getRadioValue("level");
    }

    getRadioValue(name){
        let elements = document.getElementsByName(name);
        let checkedValue = '';
    
        for (let i = 0; i < elements.length; i++){
            if (elements[i].checked) checkedValue = elements[i].value;
        }
    
        return checkedValue;
    }
}

class boardInfo{
    constructor(){
        this.cells = [];
        boardElement.innerHTML = "";
    
        // Generate a game board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
                this.cells.push(cell);
    
                // Add a click event
                cell.addEventListener("click", createCellClickHandler(row, col));
            }
        }
    
        // Place the first 4 stones
        const firstPositions = [27,28,36,35];
        for (let i=0; i<firstPositions.length; i++){
            const newPiece = document.createElement("div");
            newPiece.classList.add("piece", (i % 2 == 0 ? "black": "white"));
            this.cells[firstPositions[i]].appendChild(newPiece);
        }
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

        history.add(row, col, false);

        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", state.currentPlayer);
        this.cells[row * 8 + col].appendChild(newPiece);

        // update the number of stones
        if (state.currentPlayer === "black") state.changeScores(1,0);
        else state.changeScores(0,1);

        state.counterIncrement();

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
            if (state.currentPlayer === "black") state.changeScores(1,-1);
            else state.changeScores(-1,1);

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

            history.add(-1,-1,true);

            state.togglePlayer();
            turnElement.textContent = state.currentPlayer;

            // two passses -> end the game
            possibleCells = this.getPossibleCells()
            if (possibleCells.length == 0) state.displayEnd();

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
                    if (cell.childNodes[0].classList.contains(state.currentPlayer)) {
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
}

class gameHistory{
    constructor(){
        this.history = [];
        historyElement.innerHTML = "";
    }

    add(row, col, isPass) {

        this.history.push((row, col, isPass));

        const item = document.createElement("li");
    
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
    
        item.textContent = "";
        item.textContent += state.currentPlayer === "black" ? "Black" : "White";
        item.textContent += ` turn#${Math.floor(state.turnCounter/2)+1} `
        item.textContent += isPass ? " Pass" : ` ${toReversiCol[col]}${row+1} `;
    
        if (historyElement.firstChild) historyElement.insertBefore(item, historyElement.firstChild);
        else historyElement.appendChild(item);
    }
}

function cellClickHandler(row, col){

    const possibleCells = board.getPossibleCells();

    if (possibleCells.length == 0){

        history.add(-1,-1,true);

        state.togglePlayer();
        turnElement.textContent = state.currentPlayer;

        return;
    }

    if (board.isValidMove(row, col)) {
        board.placePiece(row, col);
        board.flipPieces(row, col);

        // update the number of stones
        state.updateScores();

        //　check if all stones are placed
        if (state.blackScore + state.whiteScore == 64) state.displayEnd();

        // update turn messages
        state.togglePlayer();
        turnElement.textContent = state.currentPlayer;

        if (board.checkPass()) return;

        // execute ai player's action
        if (settings.mode == "cp") {

            makeComputerMove();

            //　check if terminated
            if (state.blackScore + state.whiteScore == 64) state.displayEnd();

        }
    }
}

// Create a function that retains its arguments using a closure
function createCellClickHandler(row, col) {
    return function() {
        cellClickHandler(row, col);
    };
}

function initializeGame(){

    settings = new gameSettings();
    state = new gameState();
    state.updateScores();

    board = new boardInfo();
    history = new gameHistory();

}

class Agent{
    move(board){
        // should be implemented explicitly in each sub-class.
    }
}

// simple random player
class randomAgent extends Agent{
    move(board){
        let aiMove = [-1, -1];
        while (!board.isValidMove(...aiMove)) aiMove = [getRandomInt(7), getRandomInt(7)];
        return aiMove;
    }
}

// greedy strategy that place a piece so that the maximum number of stones are flipped
class simpleGreedyAgent extends Agent{
    move(board){
        let possibleCells = board.getPossibleCells();
        let MAX = 0;
        let argmax = [-1,-1];
    
        possibleCells.forEach(([row, col]) => {
    
            const flippedCells = board.getFlippedCells(row, col);
    
            if (flippedCells.length > MAX){
                MAX = flippedCells.length;
                argmax = [row, col];
            }
    
        });
    
        return argmax;
    }
}

// AI's move
function makeComputerMove(){

    let agent;
    if (settings.level == 1) agent = new randomAgent();
    else if (settings.level == 2) agent = new simpleGreedyAgent();

    const aiMove = agent.move(board);

    board.placePiece(...aiMove);
    board.flipPieces(...aiMove);

    // update the number of stones
    state.updateScores();

    // update the turn messages
    state.togglePlayer();
    turnElement.textContent = state.currentPlayer;

}

document.addEventListener("DOMContentLoaded", () => {

    confirmedBtnElement.addEventListener("click", () => {

        initializeGame();

        if (settings.mode == "cp" && settings.color == "white") makeComputerMove();

    });

    initializeGame();

});