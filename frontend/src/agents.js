"use strict";

import { convertA1ToRowCol, getRandomInt, NotImplementedError, } from './utilities.js';
import { constructInputTensor } from './tensorflow/tensorflow.js';

function le(a, b){
    return a <= b;
}

function ge(a, b){
    return a >= b;
}

export class Agent{
    move(logic){
        // should be implemented explicitly in each sub-class.
        throw new NotImplementedError("Agent class is an abstract class.");
    }
}

// mock agent that returns the same moves in the given hard-coded list.
export class mockAgent extends Agent{
    constructor(moves){
        // `moves` include both the opponent's move and the agent's move
        super();
        this.moves = moves;
    }

    move(logic){
        const currentTurnIndex = logic.history.length-1;
        const moveString = this.moves[currentTurnIndex];
        return convertA1ToRowCol(moveString);
    }
}

// simple random player
export class randomAgent extends Agent{
    move(logic){
        let possibleCells = logic.getPossibleMoves();
        if (possibleCells.length === 0) return [-1, -1];
        return possibleCells[getRandomInt(possibleCells.length-1)];
    }
}

// greedy strategy that place a piece so that the maximum number of stones are flipped
export class simpleGreedyAgent extends Agent{
    move(logic){
        let possibleCells = logic.getPossibleMoves();
        let MAX = 0;
        let argmax = [-1,-1];
    
        possibleCells.forEach(([row, col]) => {
    
            const flippedCells = logic.placePiece(row, col, false);
    
            if (flippedCells.length > MAX){
                MAX = flippedCells.length;
                argmax = [row, col];
            }
    
        });
    
        return argmax;
    }
}

// minimax agent that looks n turns ahead
export class nTurnMinimaxAgent extends Agent{

    constructor(n){
        super();
        this.n = n;
    }

    move(logic){
        let possibleCells = logic.getPossibleMoves();
        if (possibleCells.length === 0) return [-1, -1];
        this.aiPlayer = logic.currentPlayer;
        const [optimal, [row, col]] = this.DFS(logic, 0);

        return [row, col];
    }

    DFS(logic, depth){

        let optimal, func;
        let ans = [-1, -1];
        if (depth%2 === this.aiPlayer) [optimal, func] = [-Infinity, ge];
        else [optimal, func] = [Infinity, le];

        let possibleCells = logic.getPossibleMoves();
        possibleCells.forEach(([row, col]) => {
            const flippedCells = logic.placePiece(row, col, true);

            let tmp, tmpans;

            let terminated = false;
            if (depth == this.n-1) { terminated = true; }
            else {
                let possibleCellsTmp = logic.getPossibleMoves();
                if (possibleCellsTmp.length === 0) terminated = true;
            }

            if (terminated) {
                const score = logic.getScore();
                tmp = score[0] - score[1];
            }
            else {
                [tmp, tmpans] = this.DFS(logic, depth+1);
            }

            logic.undo();

            if (func(tmp, optimal)){
                optimal = tmp;
                ans = [row, col];
            }
        });

        return [optimal, ans];
    }
}

// minimax agent that looks n turns ahead or does exhaustive search if the game is almost over (64 - scoreSum <= k)
export class nTurnMinimaxLastExausiveAgent extends nTurnMinimaxAgent{
    constructor(n, k){
        super(n);
        this.k = k;
    }

    move(logic){
        const scoreSum = logic.score[0] + logic.score[1];
        if (scoreSum >= 64 - this.k) this.n = 64 - scoreSum;
        return super.move(logic);
    }
}

// alpha-beta pruning agent that looks n turns ahead
export class nTurnAlphaBetaAgent extends nTurnMinimaxAgent{
    DFS(logic, depth, alpha=-Infinity, beta=Infinity){

        let optimal, func;
        let ans = [-1, -1];
        if (depth%2 === this.aiPlayer) [optimal, func] = [-Infinity, ge];
        else [optimal, func] = [Infinity, le];

        let possibleCells = logic.getPossibleMoves();
        possibleCells.forEach(([row, col]) => {
            const flippedCells = logic.placePiece(row, col, true);

            let tmp, tmpans;

            let terminated = false;
            if (depth == this.n-1) { terminated = true; }
            else {
                let possibleCellsTmp = logic.getPossibleMoves();
                if (possibleCellsTmp.length === 0) terminated = true;
            }

            if (terminated) {
                const score = logic.getScore();
                tmp = score[0] - score[1];
            }
            else {
                [tmp, tmpans] = this.DFS(logic, depth+1, alpha, beta);
            }

            logic.undo();

            if (func(tmp, optimal)){
                optimal = tmp;
                ans = [row, col];
            }

            if (depth%2 === this.aiPlayer) alpha = Math.max(alpha, optimal);
            else beta = Math.min(beta, optimal);

            if (beta <= alpha) return[optimal, ans];
        });

        return [optimal, ans];
    }
}

// alpha-beta pruning agent that looks n turns ahead or does exhaustive search if the game is almost over (64 - scoreSum <= k)
export class nTurnAlphaBetaLastExausiveAgent extends nTurnAlphaBetaAgent{
    constructor(n, k){
        super(n);
        this.k = k;
    }

    move(logic){
        const scoreSum = logic.score[0] + logic.score[1];
        if (scoreSum >= 64 - this.k) this.n = 64 - scoreSum;
        return super.move(logic);
    }
}

export class neuralNetAgent extends Agent{
    constructor(model, debug=false){
        super();
        this.model = model;
        this.debug = debug;
    }

    async move(logic){
        let possibleCells = logic.getPossibleMoves();
        if (possibleCells.length === 0) return [-1, -1];
        this.aiPlayer = logic.currentPlayer;

        /*
        const MyBoard = [];
        const OpponentBoard = [];
        for (let i = 0; i < 8; i++){
            MyBoard.push([]);
            OpponentBoard.push([]);
            for (let j = 0; j < 8; j++){
                if (logic.board[i][j] === this.aiPlayer) {
                    MyBoard[i].push(1);
                    OpponentBoard[i].push(0);
                }
                else if (logic.board[i][j] === (this.aiPlayer^1)) {
                    OpponentBoard[i].push(1);
                    MyBoard[i].push(0);
                }
                else {
                    MyBoard[i].push(0);
                    OpponentBoard[i].push(0);
                }
            }
        }

        let inputTensor = window.tf.tensor([[MyBoard, OpponentBoard]]);
        inputTensor = inputTensor.transpose([0, 2, 3, 1]);
        */

        const inputTensor = constructInputTensor(logic, this.aiPlayer);

        const predictObj = await this.model.predict(inputTensor);
        const output = predictObj.arraySync();

        let MAX = -Infinity;
        let argmax = [-1,-1];
        possibleCells.forEach(([row, col]) => {
            if (output[0][row*8+col] > MAX){
                MAX = output[0][row*8+col];
                argmax = [row, col];
            }
        });

        if (this.debug){
            console.log("board:")
            logic.debugPrint();
            console.log("inputTensor: ", inputTensor.arraySync());
            console.log("output: ", output);
            console.log("argmax: ", argmax);
        }

        return argmax;
    }

}
