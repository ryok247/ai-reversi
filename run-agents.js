"use strict";

import { randomAgent, simpleGreedyAgent, nTurnMinimaxAgent } from "./loginApp/static/js/agents.js";
import { gameLogic } from "./loginApp/static/js/game-logic.js";

class Game {
    constructor(ai1, ai2, args1, args2) {
        this.ai1 = ai1;
        this.ai2 = ai2;
        this.args1 = args1;
        this.args2 = args2;
        this.ai1Wins = 0;
        this.ai2Wins = 0;
        this.draws = 0;
    }

    playOneGame() {
        const logic = new gameLogic();
        const ai1 = new this.ai1(...this.args1);
        const ai2 = new this.ai2(...this.args2);

        while (true) {
            const aiMove = (logic.currentPlayer === 0 ? ai1 : ai2).move(logic);
            if (aiMove[0] === -1 && aiMove[1] === -1){
                logic.pass();
            }
            else {
                logic.placePiece(...aiMove);
            }

            if (logic.isFull()) break;
            if (logic.history.length > 1 && logic.history[logic.history.length - 1][0]==-1 && logic.history[logic.history.length - 2][0]==-1) break;
        }

        const score = logic.getScore();
        if (score[0] > score[1]) this.ai1Wins++;
        else if (score[0] < score[1]) this.ai2Wins++;
        else this.draws++;
    }

    playGames(numGames) {
        for (let i = 0; i < numGames; i++) {
            this.playOneGame();
        }
    }

    printResults() {
        console.log(`AI 1 wins: ${this.ai1Wins}`);
        console.log(`AI 2 wins: ${this.ai2Wins}`);
        console.log(`Draws: ${this.draws}`);
    }
}

/*
const game = new Game(randomAgent, simpleGreedyAgent);
game.playGames(1000);
game.printResults();
*/

const game = new Game(nTurnMinimaxAgent, randomAgent, [3], []);
//const game = new Game(randomAgent, nTurnMinimaxAgent, [], [3]);
game.playGames(1000);
game.printResults();