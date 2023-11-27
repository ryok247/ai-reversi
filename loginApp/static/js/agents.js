"use strict";

import { getRandomInt } from './utilities.js';

export class Agent{
    move(board){
        // should be implemented explicitly in each sub-class.
    }
}

// simple random player
export class randomAgent extends Agent{
    move(board){
        let aiMove = [-1, -1];
        while (!board.isValidMove(...aiMove)) aiMove = [getRandomInt(7), getRandomInt(7)];
        return aiMove;
    }
}

// greedy strategy that place a piece so that the maximum number of stones are flipped
export class simpleGreedyAgent extends Agent{
    move(board){
        let possibleCells = board.getPossibleCells();
        let MAX = 0;
        let argmax = [-1,-1];
    
        possibleCells.forEach(([row, col]) => {
    
            const flippedCells = board.getFlippedCells(row, col);
    
            if (flippedCells.length > MAX){
                MAX = flippedCells.length;
                argmax = [row, col];
            }
    
        });
    
        return argmax;
    }
}