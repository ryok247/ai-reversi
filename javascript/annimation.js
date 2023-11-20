"use strict";

const progressElement = document.getElementById('progress');
const animatedBoardElement = document.querySelector(".board.animated");
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
    constructBoard(window.gamehistory.boardHistory[currentTurnIndex]);
    hightlightCurrentTurn(currentTurnIndex);
}

function startAnimation(){
    isPlaying = true;
    animationInterval = setInterval(() => {
        displayTurn(currentTurnIndex);
        currentTurnIndex++;
        updateProgressBar();
    }, 2000);
}

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

function skipToEnd() {
    currentTurnIndex = window.gamehistory.history.length - 1;
    updateProgressBar();
}

function forwardStep(){
    if (currentTurnIndex >= window.gamehistory.history.length) return;
    displayTurn(currentTurnIndex);
    currentTurnIndex++;
    updateProgressBar();
}

function backwardStep(){
    if (currentTurnIndex <= 0) return;
    currentTurnIndex--;
    displayTurn(currentTurnIndex);
    updateProgressBar();
}

function updateProgressBar() {
    const progress = (currentTurnIndex + 1) / window.gamehistory.history.length * 100;
    progressElement.style.width = `${progress}%`;
}

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

function hightlightCurrentTurn(currentTurnIndex) {
    const currentTurn = document.querySelector(".current-turn");
    if (currentTurn) currentTurn.classList.remove("current-turn");
    const currentTurnElement = document.querySelector(`.history-replay table tbody tr:nth-child(${
        window.gamehistory.history.length - currentTurnIndex
    })`);
    currentTurnElement.classList.add("current-turn");

    // Scroll to the highlighted row within the overflow-auto container
    const overflowContainer = document.querySelector('.history-replay .overflow-auto');
    const scrollTo = currentTurnElement.offsetTop - overflowContainer.offsetTop;
    overflowContainer.scrollTop = scrollTo;
}