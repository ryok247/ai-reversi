"use strict";

import { fromHistoryRowDisplayBoard } from "./animation.js";

export class gameHistory{
    constructor(historyElement, state){
        this.history = [];
        this.boardHistory = [];
        this.historyElement = historyElement;
        this.state = state;

        let tableBodyAll = document.querySelectorAll(".history-table tbody");

        tableBodyAll.forEach((tableBody) => {
            tableBody.innerHTML = "";
        });
    }

    add(row, col, isPass, board) {

        this.history.push([row, col, isPass]);
    
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

        this.addRowToHistory(
            this.state.currentPlayer === "black" ? "Black" : "White", 
            this.state.getTurnCount(), 
            isPass ? " Pass" : ` ${toReversiCol[col]}${row + 1} `
            );

        let boardColor = [];
        board.cells.forEach((cell) => {
            if (cell.childNodes.length == 0) boardColor.push("empty");
            else if (cell.childNodes[0].classList.contains("black")) boardColor.push("black");
            else if (cell.childNodes[0].classList.contains("white")) boardColor.push("white");
            else console.assert(false);
        })
        this.boardHistory.push(boardColor);
    }

    addRowToHistory(color, turnNumber, position) {
        // Get the table body
        let tableBodyAll = document.querySelectorAll(".history-table tbody");

        tableBodyAll.forEach((tableBody) => {

            // Create a new row
            let newRow = tableBody.insertRow(0);

            // Create cells for the new row
            let cell1 = newRow.insertCell(0);
            let cell2 = newRow.insertCell(1);
            let cell3 = newRow.insertCell(2);

            // Set content for each cell (you can modify this as needed)
            cell1.textContent = turnNumber;
            cell2.textContent = color;
            cell3.textContent = position;

            if (tableBody.id == "replay-table-body") {
                newRow.addEventListener("click", fromHistoryRowDisplayBoard);
            }
        });
    }
}