"use strict";

// Enum for piece colors.
export const pieceColor = {
    black: 0,
    white: 1,
}

// Class for managing game logic.
export class gameLogic {
    // Constructor: Initializes game state.
    constructor() {
        this.currentPlayer = pieceColor.black;
        this.score = [2, 2];
        this.history = [];
        this.boardHistory = [];

        // Initializes the board with empty cells and starting pieces.
        this.board = [];
        for (let i = 0; i < 8; i++) {
            this.board[i] = [];
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = -1;
            }
        }

        // Places the starting four pieces.
        this.board[3][3] = pieceColor.black;
        this.board[3][4] = pieceColor.white;
        this.board[4][3] = pieceColor.white;
        this.board[4][4] = pieceColor.black;

        // Initializes the history and board history with the starting state.
        this.history.push([-1, -1]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));
    }

    // Places a piece on the board and flips the opponent's pieces.
    placePiece(x, y) {
        console.assert(this.isValidMove(x, y));
        this.board[x][y] = this.currentPlayer;
        this.score[this.currentPlayer]++;
        let flip = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                if (!this.isValidDirection(x, y, dx, dy)) continue;
                flip = [...flip, ...this.flipDirection(x, y, dx, dy)];
            }
        }

        // Updates history and board history.
        this.history.push([x, y]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));

        // Switches the current player.
        this.currentPlayer ^= 1;

        return flip;
    }

    // Handles a pass move when no valid moves are available.
    pass() {
        console.assert(this.getPossibleMoves().length == 0);
        
        // Updates history and board history for the pass.
        this.history.push([-1, -1]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));

        // Switches the current player.
        this.currentPlayer ^= 1;

        // Two consecutive passes mean game over.
        if (this.history[this.history.length - 2][0] == -1) {
            return true;
        }

        return false;
    }

    // Flips the opponent's pieces in a specific direction.
    flipDirection(x, y, dx, dy) {
        let nx = x + dx;
        let ny = y + dy;
        let flip = [];
        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return flip;
        if (this.board[nx][ny] != (this.currentPlayer ^ 1)) return flip;
        flip.push([nx, ny]);
        while (true) {
            nx += dx;
            ny += dy;
            if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) {
                flip.pop();
                return flip;
            };
            if (this.board[nx][ny] == -1) {
                flip.pop();
                return flip;
            
            };
            if (this.board[nx][ny] == this.currentPlayer) {
                for (let i = 0; i < flip.length; i++) {
                    this.board[flip[i][0]][flip[i][1]] = this.currentPlayer;
                }
                this.score[this.currentPlayer] += flip.length;
                this.score[this.currentPlayer ^ 1] -= flip.length;
                return flip;
            }            
            flip.push([nx, ny]);
        }
    }

    // Returns an array of valid moves for the current player.
    getPossibleMoves() {
        let moves = [];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (this.isValidMove(x, y)) moves.push([x, y]);
            }
        }
        return moves;
    }

    // Checks if a move is valid for the current player.
    isValidMove(x, y) {
        if (x < 0 || x >= 8 || y < 0 || y >= 8) return false;
        if (this.board[x][y] != -1) return false;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                if (this.isValidDirection(x, y, dx, dy)) return true;
            }
        }
        return false;
    }

    // Checks if a direction is valid for flipping the opponent's pieces.
    isValidDirection(x, y, dx, dy) {
        let nx = x + dx;
        let ny = y + dy;
        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return false;
        if (this.board[nx][ny] != (this.currentPlayer ^ 1)) return false;
        while (true) {
            nx += dx;
            ny += dy;
            if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return false;
            if (this.board[nx][ny] == -1) return false;
            if (this.board[nx][ny] == this.currentPlayer) return true;
        }
    }

    // Checks if the board is full.
    isFull() { return this.score[0] + this.score[1] == 64; }

    // Undoes moves up to a certain turn index.
    undo(turnIdx) {
        this.board = this.boardHistory[turnIdx].map((arr) => arr.slice());
        this.history = this.history.slice(0, turnIdx + 1);
        this.boardHistory = this.boardHistory.slice(0, turnIdx + 1);
        this.currentPlayer = (this.history.length - 1) % 2;
        this.score = [2, 2];
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                this.score[this.board[x][y]]++;
            }
        }
    }

    // Returns the current board state.
    getCurrentBoard() {
        return this.board;
    }

    // Returns the board state at a specific turn.
    getPastBoard(turnIdx) {
        return this.boardHistory[turnIdx];
    }

    // Prints the current board state and score to the console.
    debugPrint() {
        console.log("score", this.score);
        let boardString = "\n";
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                boardString += (this.board[x][y] == -1 ? "-": this.board[x][y] == 0 ? "B" : "W") + " ";
            }
            boardString += "\n";
        }
        console.log("board", boardString);
    }
}
