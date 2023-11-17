"use strict";

import { gameState } from '../javascript/game-state.js';

document.body.innerHTML = '<div id="turn"></div>';
document.body.innerHTML += '<div id="black-score"></div>';
document.body.innerHTML += '<div id="white-score"></div>';

const state = new gameState(document.getElementById("turn"));

test("gameState: initial state", () => {
    expect(state.turnCounter["black"]).toBe(0);
    expect(state.turnCounter["white"]).toBe(0);

    expect(state.blackScore).toBe(2);
    expect(state.whiteScore).toBe(2);

    expect(state.currentPlayer).toBe("black");
    expect(state.turnElement.innerHTML).toBe("");

    state.displayTurn();

    expect(state.turnElement.innerHTML).toBe("black");

    expect(document.getElementById("black-score").textContent).toBe(String(2));
    expect(document.getElementById("white-score").textContent).toBe(String(2));

});

test("gameState: change scores", () => {

    state.changeScores(1, 0);

    expect(state.blackScore).toBe(3);
    expect(state.whiteScore).toBe(2);

    state.updateScores();

    expect(document.getElementById("black-score").textContent).toBe(String(3));
    expect(document.getElementById("white-score").textContent).toBe(String(2));

})

test("gameState: increment counter and toggle players", () => {

    state.counterIncrement();
    state.counterIncrement();
    state.counterIncrement();

    expect(state.turnCounter["black"]).toBe(3);
    expect(state.turnCounter["white"]).toBe(0);

    expect(state.currentPlayer).toBe("black");

    state.togglePlayer();

    state.counterIncrement();
    state.counterIncrement();

    expect(state.turnCounter["black"]).toBe(3);
    expect(state.turnCounter["white"]).toBe(2);

    expect(state.currentPlayer).toBe("white");

    state.displayTurn();

    expect(state.turnElement.innerHTML).toBe("white");

    expect(state.getTurnCount()).toBe(2);

    state.togglePlayer();

    expect(state.getTurnCount()).toBe(3);

})