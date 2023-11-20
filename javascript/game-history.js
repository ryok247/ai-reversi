"use strict";

export class gameHistory{
    constructor(historyElement, state){
        this.history = [];
        this.boardHistory = [];
        this.historyElement = historyElement;
        this.historyElement.innerHTML = "";
        this.state = state;
    }

    add(row, col, isPass, board) {

        this.history.push([row, col, isPass]);

        const item = document.createElement("li");
    
        const toReversiCol = {
            0: "A",
            1: "B",
            2: "C",
            3: "D",
            4: "E",
            5: "F",
            6: "G",
            7: "H"
        }
    
        item.textContent = "";
        item.textContent += this.state.currentPlayer === "black" ? "Black" : "White";
        item.textContent += ` turn#${this.state.getTurnCount()} `
        item.textContent += isPass ? " Pass" : ` ${toReversiCol[col]}${row + 1} `;
    
        if (this.historyElement.firstChild) this.historyElement.insertBefore(item, this.historyElement.firstChild);
        else this.historyElement.appendChild(item);

        let boardColor = [];
        board.cells.forEach((cell) => {
            if (cell.childNodes.length == 0) boardColor.push("empty");
            else if (cell.childNodes[0].classList.contains("black")) boardColor.push("black");
            else if (cell.childNodes[0].classList.contains("white")) boardColor.push("white");
            else console.assert(false);
        })
        this.boardHistory.push(boardColor);
    }
}