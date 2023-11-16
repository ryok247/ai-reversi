//　Declare global varialbes
let counter, blackScore, whiteScore;
let mode,color,level;
let cells,currentPlayer;
const board = document.querySelector(".board");
const turn = document.getElementById("turn");
const confirmedBtn = document.getElementById("confirmed-btn");
const history = document.getElementById("history");

function getRadioValue(name){
    let elements = document.getElementsByName(name);
    let checkedValue = '';

    for (let i = 0; i < elements.length; i++){
        if (elements[i].checked) checkedValue = elements[i].value;
    }

    return checkedValue;
}

// generate random integer between [0,max]
function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function initializeGame(){

    // Load settings
    mode = getRadioValue("mode");
    color = getRadioValue("color");
    level = getRadioValue("level");

    // How many turns are done
    counter = 0;

    // Initial scores
    blackScore = 2;
    whiteScore = 2;

    updateScores();

    cells = [];

    currentPlayer = "black"; // First player takes black pieces

    history.innerHTML = "";
    board.innerHTML = "";

    // Generate a game board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            board.appendChild(cell);
            cells.push(cell);

            // Add a click event
            cell.addEventListener("click", () => {

                const possibleCells = getPossibleCells();

                if (possibleCells.length == 0){

                    addHistory(-1,-1,true);

                    turn.textContent = currentPlayer === "black" ? "White" : "Black";
                    currentPlayer = currentPlayer === "black" ? "white" : "black";

                    return;
                }

                if (isValidMove(row, col)) {
                    placePiece(row, col);
                    flipPieces(row, col);

                    // update the number of stones
                    updateScores();

                    //　check if all stones are placed
                    if (blackScore + whiteScore == 64) displayEnd();

                    // update turn messages
                    turn.textContent = currentPlayer === "black" ? "White" : "Black";
                    currentPlayer = currentPlayer === "black" ? "white" : "black";

                    let isPass = checkPass();
                    if (isPass) return;

                    // execute ai player's action
                    if (mode == "cp") {

                        makeComputerMove();

                        //　check if terminated
                        if (blackScore + whiteScore == 64) displayEnd();

                    }
                }
            });
        }
    }

    // Place the first 4 stones
    const firstPositions = [27,28,36,35];
    for (let i=0; i<firstPositions.length; i++){
        const newPiece = document.createElement("div");
        newPiece.classList.add("piece", (i%2==0 ? "black": "white"));
        cells[firstPositions[i]].appendChild(newPiece);
    }

}

// check the position is valid for placement
function isValidMove(row, col) {

    if (row < 0 || row > 7 || col < 0 || col > 7) return false;

    const cell = cells[row * 8 + col];

    // impossible if some stone is already placed in the position
    if (cell.childNodes.length == 1)  return false;

    const flippedCells = getFlippedCells(row, col);

    return flippedCells.length > 0;
}

// Place a stone
function placePiece(row, col) {

    addHistory(row, col, false);

    const newPiece = document.createElement("div");
    newPiece.classList.add("piece", currentPlayer);
    cells[row * 8 + col].appendChild(newPiece);

    // update the number of stones
    if (currentPlayer === "black") blackScore++;
    else whiteScore++;

    counter++;

}

// displays a message if the game is terminated
function displayEnd() {
    let resultMessage = '';
    if (blackScore > whiteScore) resultMessage = 'Black Wins!';
    else if (blackScore < whiteScore) resultMessage = 'White Wins!';
    else resultMessage = 'Draw!';

    alert(`${resultMessage}\nBlack: ${blackScore}\nWhite: ${whiteScore}`);
}

// Add data to history in each turn
function addHistory(row, col, isPass) {
    const item = document.createElement("li");

    const toOthelloCol = {
        0: "A",
        1: "B",
        2: "C",
        3: "D",
        4: "E",
        5: "F",
        6: "G",
        7: "H"
    }

    let text = "";
    text += currentPlayer === "black" ? "Black" : "White";
    text += ` turn#${Math.floor(counter/2)+1} `
    text += isPass ? " Pass" : ` ${toOthelloCol[col]}${row+1} `;
    item.textContent = text;

    if (history.firstChild) history.insertBefore(item, history.firstChild);
    else history.appendChild(item);
}

// flip stones
function flipPieces(row, col) {

    const flippedCells = getFlippedCells(row, col);

    flippedCells.forEach((cell) => {

        if (cell.childNodes.length == 1){
            cell.childNodes[0].classList.toggle("black");
            cell.childNodes[0].classList.toggle("white");
        }

        // update the number of stones
        if (currentPlayer === "black") {
            blackScore++;
            whiteScore--;
        } else {
            blackScore--;
            whiteScore++;
        }

    });
}

// update and display the scores
function updateScores() {
    const blackScoreElement = document.getElementById("black-score");
    const whiteScoreElement = document.getElementById("white-score");
    
    blackScoreElement.textContent = blackScore;
    whiteScoreElement.textContent = whiteScore;
}

// return a possible cells
function getPossibleCells(){
    possibleCells = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col)) possibleCells.push([row,col]);
        }
    }

    return possibleCells;
}

// check if the current player has to pass (no valid place)
// terminate the game if the both player have to pass
function checkPass(){

    let possibleCells = getPossibleCells();

    if (possibleCells.length == 0){

        addHistory(-1,-1,true);

        turn.textContent = currentPlayer === "black" ? "White" : "Black";
        currentPlayer = currentPlayer === "black" ? "white" : "black";

        // two passses -> end the game
        possibleCells = getPossibleCells()
        if (possibleCells.length == 0) displayEnd();

        return true;
    }

    return false;
}

// AI's move
function makeComputerMove(){

    let aiMove = [-1,-1];
    if (level == 1) aiMove = randomMove();
    else if (level == 2) aiMove = simpleGreedyMove();

    const aiRow = aiMove[0];
    const aiCol = aiMove[1];

    placePiece(aiRow, aiCol);
    flipPieces(aiRow, aiCol);

    turn.textContent = currentPlayer === "black" ? "White" : "Black";

    // update the number of stones
    updateScores();

    // update the turn messages
    currentPlayer = currentPlayer === "black" ? "white" : "black";

}

// simple random player
function randomMove(){
    let aiRow = -1;
    let aiCol = -1;

    while (!isValidMove(aiRow, aiCol)){
        aiRow = getRandomInt(7);
        aiCol = getRandomInt(7);
    }

    return [aiRow, aiCol];
}

// greedy strategy that place a piece so that the maximum number of stones are flipped
function simpleGreedyMove(){
    let possibleCells = getPossibleCells();
    let MAX = 0;
    let argmax = [-1,-1];

    possibleCells.forEach(([row, col]) => {

        const flippedCells = getFlippedCells(row, col);

        if (flippedCells.length > MAX){
            MAX = flippedCells.length;
            argmax = [row, col];
        }

    });

    return argmax;
}

// estimated the number of flipped stone if a new stone is placed on (row, col)
function getFlippedCells(row, col){
    const directions = [-1, 0, 1];
    const flippedCells = [];

    directions.forEach((dx) => {
        directions.forEach((dy) => {
            if (dx === 0 && dy === 0) return;

            let currentRow = row + dx;
            let currentCol = col + dy;
            let flipTemp = [];

            while (
                currentRow >= 0 &&
                currentRow < 8 &&
                currentCol >= 0 &&
                currentCol < 8
            ) {
                const cell = cells[currentRow * 8 + currentCol];
                if (!cell) break;
                if (cell.childNodes.length == 0) break;
                if (cell.childNodes[0].classList.contains(currentPlayer)) {
                    flippedCells.push(...flipTemp);
                    break;
                }
                flipTemp.push(cell);
                currentRow += dx;
                currentCol += dy;
            }
        });
    });

    return flippedCells;
}

document.addEventListener("DOMContentLoaded", () => {

    confirmedBtn.addEventListener("click", () => {

        initializeGame();

        if (mode == "cp" && color == "white"){
            makeComputerMove();
        }

    });

    initializeGame();

});