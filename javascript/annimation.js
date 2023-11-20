"use strict";

// const animatedShape = document.getElementById('animatedShape');
const progressElement = document.getElementById('progress');
const animatedBoardElement = document.querySelector(".board.animated");
// const shapes = ['square', 'circle', 'triangle'];
// let currentShapeIndex = 0;
let currentTurnIndex = 0;
let animationInterval;
let isPlaying = false;
let cells;

document.addEventListener("DOMContentLoaded", () => {
    currentTurnIndex = 0;
    reloadPage();
});

function reloadPage(){

    currentTurnIndex = 0;

    resetBoard();

    // Place the first 4 stones
    const firstPositions = [27,28,36,35];
    for (let i=0; i<firstPositions.length; i++){
        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", (i % 2 == 0 ? "black": "white"));
        cells[firstPositions[i]].appendChild(newPiece);
    }
}

function resetBoard(){
    while (animatedBoardElement.firstChild) {
        animatedBoardElement.removeChild(animatedBoardElement.firstChild);
    }
    cells = [];
    // Generate a game board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            animatedBoardElement.appendChild(cell);
            cells.push(cell);
        }
    }
}

function constructBoard(eachBoardHistory){

    resetBoard();

    eachBoardHistory.forEach((cellColor, index) => {
        if (cellColor == "empty") return;
        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", cellColor);
        cells[index].appendChild(newPiece);
    });
}

function displayTurn(currentTurnIndex){
    if (currentTurnIndex >= window.gamehistory.history.length) return;
    //const [row, col, isPass] = window.gamehistory.history[currentTurnIndex];
    //console.log(window.gamehistory.boardHistory[currentTurnIndex]);
    //if (isPass) return;
    //const newPiece = document.createElement("div");
    //newPiece.classList.add("piece", (currentTurnIndex % 2 == 0 ? "black": "white"));
    //cells[row * 8 + col].appendChild(newPiece);
    constructBoard(window.gamehistory.boardHistory[currentTurnIndex]);
}

function startAnimation(){
    isPlaying = true;
    animationInterval = setInterval(() => {
        displayTurn(currentTurnIndex);
        currentTurnIndex++;
        updateProgressBar();
    }, 2000);
}

/*
function startAnimation() {
    isPlaying = true;
    animationInterval = setInterval(() => {
        currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
        const nextShape = shapes[currentShapeIndex];
        animatedShape.className = `shape ${nextShape}`;
        updateProgressBar();
    }, 2000); // Change shape every 2 seconds
}
*/

function pauseAnimation() {
    isPlaying = false;
    clearInterval(animationInterval);
}

function restartAnimation() {
    currentTurnIndex = 0;
    reloadPage();
    displayTurn(currentTurnIndex);
    updateProgressBar();
}

/*
function restartAnimation() {
    currentShapeIndex = 0;
    const nextShape = shapes[currentShapeIndex];
    animatedShape.className = `shape ${nextShape}`;
    updateProgressBar();
}
*/

function skipToEnd() {
    currentTurnIndex = window.gamehistory.history.length - 1;
    updateProgressBar();
}

/*
function skipToEnd() {
    currentShapeIndex = shapes.length - 1;
    const nextShape = shapes[currentShapeIndex];
    animatedShape.className = `shape ${nextShape}`;
    updateProgressBar();
}
*/

function updateProgressBar() {
    const progress = (currentTurnIndex + 1) / window.gamehistory.history.length * 100;
    progressElement.style.width = `${progress}%`;
}

/*
function updateProgressBar() {
    const progress = (currentShapeIndex + 1) / shapes.length * 100;
    progressElement.style.width = `${progress}%`;
}
*/

function seek(event) {
    if (isPlaying) {
        pauseAnimation();
    }

    const progressBar = event.currentTarget;
    const clickX = event.clientX - progressBar.getBoundingClientRect().left;
    const progress = (clickX / progressBar.clientWidth) * window.gamehistory.history.length;
    currentTurnIndex = Math.floor(progress);

    reloadPage();
    for (let i=0; i<=currentTurnIndex; i++){
        displayTurn(i);
    }

    updateProgressBar();
}

/*
function seek(event) {
    if (isPlaying) {
        pauseAnimation();
    }

    const progressBar = event.currentTarget;
    const clickX = event.clientX - progressBar.getBoundingClientRect().left;
    const progress = (clickX / progressBar.clientWidth) * shapes.length;
    currentShapeIndex = Math.floor(progress);
    const nextShape = shapes[currentShapeIndex];
    animatedShape.className = `shape ${nextShape}`;
    updateProgressBar();
}
*/