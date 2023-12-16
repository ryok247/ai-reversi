"use strict";

import { getRandomInt, NotImplementedError } from './utilities.js';

export class Agent{
    move(logic){
        // should be implemented explicitly in each sub-class.
        throw new NotImplementedError("Agent class is an abstract class.");
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

export class nTurnMinimaxAgent extends Agent{
    constructor(n){
        super();
        this.n = n;
    }

    move(logic){
        let possibleCells = logic.getPossibleMoves();
        if (possibleCells.length === 0) return [-1, -1];
        this.aiPlayer = logic.currentPlayer;
        const result = {};
        this.maxDepth = 0;
        this.calcNTurnScoreDFS(logic, 0, result);
        const [optimal, [row, col]] = this.calcOptimalDFS(0, result);

        /*
        console.log()
        console.log(logic.score[0], logic.score[1]);
        //console.log(result);
        console.log(optimal, [row, col]);
        console.log()
        */

        return [row, col];
    }

    calcNTurnScoreDFS(logic, depth, result){
        let possibleCells = logic.getPossibleMoves();
        possibleCells.forEach(([row, col]) => {
            const flippedCells = logic.placePiece(row, col, true);
            const key = `${row},${col}`
            if (!([row, col] in result)) result[key] = {};
            if (depth == this.n-1) {
                result[key] = logic.getScore();
                this.maxDepth = Math.max(this.maxDepth, depth);
            }
            else {
                let possibleCellsTmp = logic.getPossibleMoves();
                if (possibleCellsTmp.length == 0) {
                    result[key] = logic.getScore();
                    this.maxDepth = Math.max(this.maxDepth, depth);
                }
                else this.calcNTurnScoreDFS(logic, depth+1, result[key]);
            }
            logic.undo();
        });
    }

    calcOptimalDFS(depth, result){
        let optimal, func;
        let ans = [-1, -1];
        if (depth%2 == this.aiPlayer) [optimal, func] = [-Infinity, ge];
        else [optimal, func] = [Infinity, le];
        Object.keys(result).forEach((key) => {
            let tmp, tmpans;
            if (depth == this.maxDepth) tmp = result[key][0] - result[key][1];
            else [tmp, tmpans] = this.calcOptimalDFS(depth+1, result[key]);
            if (func(tmp, optimal)){
                optimal = tmp;
                ans = key.split(',').map((x) => parseInt(x));
            }
        });
        return [optimal, ans];
    }
}

function le(a, b){
    return a <= b;
}

function ge(a, b){
    return a >= b;
}