"use strict";

export class ReplayAnimator {
    // Constructor: Initializes game logic, board element, and progress bar.
    constructor(gameLogicInstance, boardElement, progressElement) {
        this.gameLogic = gameLogicInstance;
        this.boardElement = boardElement;
        this.progressElement = progressElement;
        this.currentTurnIndex = -1;
        this.isPlaying = false;
        this.animationInterval = null;
        this.cells = [];
        this.initBoard();
        this.placeInitialPieces();
    }

    // Initializes the game board by clearing and creating cells.
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
    }

    // Places the initial pieces on the board.
    placeInitialPieces() {
        const firstPositions = [27, 28, 36, 35];
        for (let i = 0; i < firstPositions.length; i++) {
            const newPiece = document.createElement("div");
            newPiece.classList.add("piece", (i % 2 === 0 ? "black" : "white"));
            this.cells[firstPositions[i]].appendChild(newPiece);
        }
    }

    // Constructs the board for each step in the game history.
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

    // Displays the game board for a specific turn in the replay.
    displayReplayBoard(turnIndex) {
        if (turnIndex + 1 >= this.gameLogic.history.length) return;
        this.constructBoard(this.gameLogic.boardHistory[turnIndex + 1]);
        this.highlightCurrentTurn(turnIndex);
    }

    // Starts the animation for replay.
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
            this.updateProgressBar(this.currentTurnIndex);
        }, 1000);
    }

    // Pauses the animation.
    pauseAnimation() {
        this.isPlaying = false;
        clearInterval(this.animationInterval);
    }

    // Restarts the animation from the beginning.
    restartAnimation() {
        this.currentTurnIndex = -1;
        this.initBoard();
        this.displayReplayBoard(this.currentTurnIndex);
        this.updateProgressBar(this.currentTurnIndex);
    }

    // Skips to the end of the animation.
    skipToEnd() {
        this.currentTurnIndex = this.gameLogic.history.length - 2;
        this.displayReplayBoard(this.currentTurnIndex);
        this.updateProgressBar(this.currentTurnIndex);
    }

    // Moves one step forward in the animation.
    forwardStep() {
        if (this.currentTurnIndex < this.gameLogic.history.length - 2) {
            this.currentTurnIndex++;
            this.displayReplayBoard(this.currentTurnIndex);
            this.updateProgressBar(this.currentTurnIndex);
        }
    }

    // Moves one step backward in the animation.
    backwardStep() {
        if (this.currentTurnIndex > -1) {
            this.currentTurnIndex--;
            this.displayReplayBoard(this.currentTurnIndex);
            this.updateProgressBar(this.currentTurnIndex);
        }
    }

    // Updates the progress bar based on the current turn.
    updateProgressBar(turnIndex) {
        const progress = (turnIndex + 2) / this.gameLogic.history.length * 100;
        this.progressElement.style.width = `${progress}%`;
    }

    // Handles seeking to a specific turn in the animation.
    seek(event) {
        const progressBar = event.currentTarget;
        const clickX = event.clientX - progressBar.getBoundingClientRect().left;
        const progress = (clickX / progressBar.clientWidth) * this.gameLogic.history.length;
        this.currentTurnIndex = Math.floor(progress);
        this.initBoard();
        for (let i = 0; i <= this.currentTurnIndex; i++) {
            this.displayReplayBoard(i);
        }
        this.updateProgressBar(this.currentTurnIndex);
    }

    // Highlights the current turn in the game history table.
    highlightCurrentTurn(turnIndex) {
        // Remove highlight from all rows in history table.
        const rows = document.querySelectorAll('.history-replay table tbody tr');
        rows.forEach(row => row.classList.remove("current-turn"));
    
        // Highlight the row corresponding to the current turn.
        const currentRow = rows[rows.length - turnIndex - 1];
        if (currentRow) {
            currentRow.classList.add("current-turn");
    
            // Scroll to ensure the highlighted row is visible.
            currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Handles displaying the board from a specific history row click.
    fromHistoryRowDisplayBoard(event) {
        const row = event.currentTarget;
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        this.currentTurnIndex = this.gameLogic.history.length - rowIndex - 2;
        this.displayReplayBoard(this.currentTurnIndex);
        this.updateProgressBar(this.currentTurnIndex);
        this.isPlaying = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }    
}
