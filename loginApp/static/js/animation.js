"use strict";

import { sharedState } from "./game-shared.js";

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

document.getElementById("restart-animation-btn").addEventListener("click", restartAnimation);
document.getElementById("backward-step-btn").addEventListener("click", backwardStep);
document.getElementById("start-animation-btn").addEventListener("click", startAnimation);
document.getElementById("pause-animation-btn").addEventListener("click", pauseAnimation);
document.getElementById("forward-step-btn").addEventListener("click", forwardStep);
document.getElementById("skip-to-end-btn").addEventListener("click", skipToEnd);
progressElement.addEventListener("click", seek);


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

    for (let i=0; i<8; i++){
        for (let j=0; j<8; j++){
            if (eachBoardHistory[i][j] == -1) continue;
            const newPiece = document.createElement("div");
            newPiece.classList.add("piece", (eachBoardHistory[i][j] == 0 ? "black": "white"));
            cells[i*8+j].appendChild(newPiece);
        }
    }
}

function displayReplayBoard(currentTurnIndex){
    if (currentTurnIndex + 1 >= sharedState.logic.history.length) return;
    constructBoard(sharedState.logic.boardHistory[currentTurnIndex + 1]);
    hightlightCurrentTurn(currentTurnIndex);
}

function startAnimation(){
    isPlaying = true;
    animationInterval = setInterval(() => {
        // isPlayingがfalseの場合、アニメーションを停止
        if (!isPlaying) {
            clearInterval(animationInterval);
            return;
        }

        displayReplayBoard(currentTurnIndex);
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
    displayReplayBoard(currentTurnIndex);
    updateProgressBar();
}

function skipToEnd() {
    currentTurnIndex = sharedState.logic.history.length - 2;
    updateProgressBar();
}

function forwardStep(){
    if (currentTurnIndex+1 >= sharedState.logic.history.length) return;
    displayReplayBoard(currentTurnIndex);
    currentTurnIndex++;
    updateProgressBar();
}

function backwardStep(){
    if (currentTurnIndex <= 0) return;
    currentTurnIndex--;
    displayReplayBoard(currentTurnIndex);
    updateProgressBar();
}

function updateProgressBar() {
    const progress = (currentTurnIndex + 1) / sharedState.logic.history.length * 100;
    progressElement.style.width = `${progress}%`;
}

function seek(event) {
    if (isPlaying) {
        pauseAnimation();
    }

    const progressBar = event.currentTarget;
    const clickX = event.clientX - progressBar.getBoundingClientRect().left;
    const progress = (clickX / progressBar.clientWidth) * sharedState.logic.history.length;
    currentTurnIndex = Math.floor(progress);

    reloadPage();
    for (let i=0; i<=currentTurnIndex; i++){
        displayReplayBoard(i);
    }

    updateProgressBar();
}

function hightlightCurrentTurn(currentTurnIndex) {
    const currentTurn = document.querySelector(".current-turn");
    if (currentTurn) currentTurn.classList.remove("current-turn");
    const currentTurnElement = document.querySelector(`.history-replay table tbody tr:nth-child(${
        sharedState.logic.history.length - currentTurnIndex - 1
    })`);
    currentTurnElement.classList.add("current-turn");

    // Scroll to the highlighted row within the overflow-auto container
    const overflowContainer = document.querySelector('.history-replay .overflow-auto');
    const scrollTo = currentTurnElement.offsetTop - overflowContainer.offsetTop;
    overflowContainer.scrollTop = scrollTo;
}

export function fromHistoryRowDisplayBoard(event){
    const currentTurnElement = event.currentTarget;
    const currentTurnIndex = parseInt(currentTurnElement.childNodes[0].textContent)-1;
    displayReplayBoard(currentTurnIndex);
    isPlaying = false;
}