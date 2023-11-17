"use strict";

import { gameState } from './game-state.js';
import { gameSettings } from './game-settings.js';
import { gameHistory } from './game-history.js';
import { boardInfo } from './game-logic.js';

const boardElement = document.querySelector(".board");
const turnElement = document.getElementById("turn");
const confirmedBtnElement = document.getElementById("confirmed-btn");
const historyElement = document.getElementById("history");
let state, settings, board, history;

function initializeGame(historyElement){

    settings = new gameSettings();
    state = new gameState(turnElement);
    history = new gameHistory(historyElement, state);
    board = new boardInfo(state, settings, history, boardElement, turnElement);

}

document.addEventListener("DOMContentLoaded", () => {

    confirmedBtnElement.addEventListener("click", () => {

        initializeGame(historyElement);

        if (settings.mode == "cp" && settings.color == "white") board.makeComputerMove();

    });

    initializeGame(historyElement);

});