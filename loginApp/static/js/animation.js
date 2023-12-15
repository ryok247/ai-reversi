"use strict";

export class ReplayAnimator {
    constructor(gameLogicInstance, boardElement, progressElement) {
        this.gameLogic = gameLogicInstance;
        this.boardElement = boardElement;
        this.progressElement = progressElement;
        this.currentTurnIndex = 0;
        this.isPlaying = false;
        this.animationInterval = null;
        this.cells = [];
        this.initBoard();
    }

    initBoard() {
        this.cells = [];
        while (this.boardElement.firstChild) {
            this.boardElement.removeChild(this.boardElement.firstChild);
        }
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.boardElement.appendChild(cell);
                this.cells.push(cell);
            }
        }
        this.placeInitialPieces();
    }

    placeInitialPieces() {
        const firstPositions = [27, 28, 36, 35];
        for (let i = 0; i < firstPositions.length; i++) {
            const newPiece = document.createElement("div");
            newPiece.classList.add("piece", (i % 2 === 0 ? "black" : "white"));
            this.cells[firstPositions[i]].appendChild(newPiece);
        }
    }

    constructBoard(eachBoardHistory) {
        this.initBoard();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (eachBoardHistory[i][j] === -1) continue;
                const newPiece = document.createElement("div");
                newPiece.classList.add("piece", (eachBoardHistory[i][j] === 0 ? "black" : "white"));
                this.cells[i * 8 + j].appendChild(newPiece);
            }
        }
    }

    displayReplayBoard(turnIndex) {
        if (turnIndex + 1 >= this.gameLogic.history.length) return;
        this.constructBoard(this.gameLogic.boardHistory[turnIndex + 1]);
        this.highlightCurrentTurn(turnIndex);
    }

    startAnimation() {
        this.isPlaying = true;
        this.animationInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(this.animationInterval);
                return;
            }
            this.displayReplayBoard(this.currentTurnIndex);
            if (this.currentTurnIndex < this.gameLogic.history.length - 1) {
                this.currentTurnIndex++;
            }
            this.updateProgressBar();
        }, 1000);
    }

    pauseAnimation() {
        this.isPlaying = false;
        clearInterval(this.animationInterval);
    }

    restartAnimation() {
        this.currentTurnIndex = 0;
        this.initBoard();
        this.displayReplayBoard(this.currentTurnIndex);
        this.updateProgressBar();
    }

    skipToEnd() {
        this.currentTurnIndex = this.gameLogic.history.length - 2;
        this.updateProgressBar();
    }

    forwardStep() {
        if (this.currentTurnIndex < this.gameLogic.history.length - 1) {
            this.displayReplayBoard(this.currentTurnIndex);
            this.currentTurnIndex++;
            this.updateProgressBar();
        }
    }

    backwardStep() {
        if (this.currentTurnIndex > 0) {
            this.currentTurnIndex--;
            this.displayReplayBoard(this.currentTurnIndex);
            this.updateProgressBar();
        }
    }

    updateProgressBar() {
        const progress = (this.currentTurnIndex + 1) / this.gameLogic.history.length * 100;
        this.progressElement.style.width = `${progress}%`;
    }

    seek(event) {
        const progressBar = event.currentTarget;
        const clickX = event.clientX - progressBar.getBoundingClientRect().left;
        const progress = (clickX / progressBar.clientWidth) * this.gameLogic.history.length;
        this.currentTurnIndex = Math.floor(progress);
        this.initBoard();
        for (let i = 0; i <= this.currentTurnIndex; i++) {
            this.displayReplayBoard(i);
        }
        this.updateProgressBar();
    }

    highlightCurrentTurn(turnIndex) {
        // 履歴表内の全行のハイライトを削除
        const rows = document.querySelectorAll('.history-replay table tbody tr');
        rows.forEach(row => row.classList.remove("current-turn"));
    
        // 現在の手番の行をハイライト
        const currentRow = rows[rows.length - turnIndex - 1];
        if (currentRow) {
            currentRow.classList.add("current-turn");
    
            // ハイライトされた行が表示されるようにスクロール
            currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    fromHistoryRowDisplayBoard(event) {
        const row = event.currentTarget;
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        this.currentTurnIndex = this.gameLogic.history.length - rowIndex - 2;
        this.displayReplayBoard(this.currentTurnIndex);
        this.updateProgressBar();
        this.isPlaying = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }    
}
