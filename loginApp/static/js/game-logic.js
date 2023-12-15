export const pieceColor = {
    black: 0,
    white: 1,
}

export class gameLogic{
    constructor(){
        this.currentPlayer = pieceColor.black;
        this.score = [2, 2];
        this.history = [];
        this.boardHistory = [];

        this.board = [];
        for (let i = 0; i < 8; i++) {
            this.board[i] = [];
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = -1;
            }
        }

        this.board[3][3] = pieceColor.black;
        this.board[3][4] = pieceColor.white;
        this.board[4][3] = pieceColor.white;
        this.board[4][4] = pieceColor.black;

        this.history.push([-1, -1]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));
    }

    placePiece(x, y){
        console.assert(this.isValidMove(x, y));
        this.board[x][y] = this.currentPlayer;
        this.score[this.currentPlayer]++;
        let flip = [];
        for (let dx = -1; dx <= 1; dx++){
            for (let dy = -1; dy <= 1; dy++){
                if (dx == 0 && dy == 0) continue;
                if (!this.isValidDirection(x, y, dx, dy)) continue;
                flip = [...flip, ...this.flipDirection(x, y, dx, dy)];
            }
        }

        this.history.push([x, y]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));

        this.currentPlayer ^= 1;

        return flip;
    }

    pass(){
        console.assert(this.getPossibleMoves().length == 0);
        
        this.history.push([-1, -1]);
        this.boardHistory.push(this.board.map((arr) => arr.slice()));

        this.currentPlayer ^= 1;

        // pass twice -> game over
        if (this.history[this.history.length - 2][0] == -1){
            return true;
        }

        return false;
    }

    flipDirection(x, y, dx, dy){
        let nx = x + dx;
        let ny = y + dy;
        let flip = [];
        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return flip;
        if (this.board[nx][ny] != (this.currentPlayer ^ 1)) return flip;
        flip.push([nx, ny]);
        while (true){
            nx += dx;
            ny += dy;
            if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8){
                flip.pop();
                return flip;
            };
            if (this.board[nx][ny] == -1){
                flip.pop();
                return flip;
            
            };
            if (this.board[nx][ny] == this.currentPlayer){
                for (let i = 0; i < flip.length; i++){
                    this.board[flip[i][0]][flip[i][1]] = this.currentPlayer;
                }
                this.score[this.currentPlayer] += flip.length;
                this.score[this.currentPlayer ^ 1] -= flip.length;
                return flip;
            }            
            flip.push([nx, ny]);
        }
    }

    getPossibleMoves(){
        let moves = [];
        for (let x = 0; x < 8; x++){
            for (let y = 0; y < 8; y++){
                if (this.isValidMove(x, y)) moves.push([x, y]);
            }
        }
        return moves;
    }

    isValidMove(x, y){
        if (x < 0 || x >= 8 || y < 0 || y >= 8) return false;
        if (this.board[x][y] != -1) return false;
        for (let dx = -1; dx <= 1; dx++){
            for (let dy = -1; dy <= 1; dy++){
                if (dx == 0 && dy == 0) continue;
                if (this.isValidDirection(x, y, dx, dy)) return true;
            }
        }
        return false;
    }

    isValidDirection(x, y, dx, dy){
        let nx = x + dx;
        let ny = y + dy;
        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return false;
        if (this.board[nx][ny] != (this.currentPlayer ^ 1)) return false;
        while (true){
            nx += dx;
            ny += dy;
            if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8) return false;
            if (this.board[nx][ny] == -1) return false;
            if (this.board[nx][ny] == this.currentPlayer) return true;
        }
    }

    isFull(){return this.score[0] + this.score[1] == 64;}

    undo(turnIdx){
        this.board = this.boardHistory[turnIdx].map((arr) => arr.slice());
        this.history = this.history.slice(0, turnIdx+1);
        this.boardHistory = this.boardHistory.slice(0, turnIdx+1);
        this.currentPlayer = (this.history.length - 1) % 2;
        this.score = [2, 2];
        for (let x = 0; x < 8; x++){
            for (let y = 0; y < 8; y++){
                this.score[this.board[x][y]]++;
            }
        }
    }

    getCurrentBoard(){
        return this.board;
    }

    getPastBoard(turnIdx){
        return this.boardHistory[turnIdx];
    }

    debugPrint(){
        console.log("score", this.score);
        let boardString = "\n";
        for (let x = 0; x < 8; x++){
            for (let y = 0; y < 8; y++){
                boardString += (this.board[x][y] == -1 ? "-": this.board[x][y] == 0 ? "B" : "W") + " ";
            }
            boardString += "\n";
        }
        console.log("board", boardString);
    }
}
