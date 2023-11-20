"use strict";

import { gameState } from './game-state.js';
import { gameSettings } from './game-settings.js';
import { gameHistory } from './game-history.js';
import { boardInfo } from './game-logic.js';

const boardElement = document.querySelector(".board");
const turnElement = document.getElementById("turn");
const confirmedBtnElement = document.getElementById("confirmed-btn");
const historyElement = document.getElementById("history");

function initializeGame(historyElement){

    window.settings = new gameSettings("mode", "color", "level", "highlight");
    window.state = new gameState(turnElement);
    window.gamehistory = new gameHistory(historyElement, window.state);
    window.board = new boardInfo(window.state, window.settings, window.gamehistory, boardElement);

}

document.addEventListener("DOMContentLoaded", () => {

    confirmedBtnElement.addEventListener("click", () => {

        initializeGame(historyElement);

        if (settings.mode == "cp" && settings.color == "white") board.makeComputerMove();
        
        board.highlightPossibleCells();

    });

    initializeGame(historyElement);

});