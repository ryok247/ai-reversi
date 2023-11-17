"use strict";

export class gameState{
    constructor(turnElement){
        this.turnCounter = {
            "black": 0,
            "white": 0
        };
        this.blackScore = 2;
        this.whiteScore = 2;
        this.currentPlayer = "black";
        this.turnElement = turnElement;

        this.updateScores();
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
        this.turnCounter[this.currentPlayer]++;
    }

    togglePlayer(){
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    }

    displayTurn(){
        this.turnElement.textContent = this.currentPlayer;
    }

    getTurnCount(){
        return this.turnCounter[this.currentPlayer];
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
