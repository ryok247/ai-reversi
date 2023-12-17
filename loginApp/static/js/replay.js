import { gameLogic } from "./game-logic.js"
import { ReplayAnimator } from './animation.js';
import { addToHistoryTable } from "./manage-game.js";

let logic = new gameLogic();
const progressElement = document.getElementById('progress');
const animatedBoardElement = document.querySelector(".board.animated");
const animator = new ReplayAnimator(logic, animatedBoardElement, progressElement);

document.addEventListener('DOMContentLoaded', function() {
    const gameId = document.getElementById('game-id').value;

    // Get game details and display them
    fetch(`/get_game_details/${gameId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Game ID ${gameId} not found`);
        }
        return response.json();
    })
    .then(game => {
        // Other columns
        const dateElement = document.getElementById('info-date');
        dateElement.textContent = new Date(game.game_datetime).toLocaleDateString();
    
        const timeElement = document.getElementById('info-time');
        timeElement.textContent = new Date(game.game_datetime).toLocaleTimeString();
    
        const colorElement = document.getElementById('info-color');
        colorElement.textContent = game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1);
    
        const resultElement = document.getElementById('info-result');
        if (game.player_color == "black"){
            resultElement.textContent = game.black_score > game.white_score ? 'Win' : game.black_score < game.white_score ? 'Lose' : 'Draw';
        } else {
            resultElement.textContent = game.black_score > game.white_score ? 'Lose' : game.black_score < game.white_score ? 'Win' : 'Draw';
        }
        row.appendChild(resultColumn);
    
        const blackScoreElement = document.getElementById('info-black-score');
        blackScoreElement.textContent = game.black_score;
    
        const whiteScoreElement = document.getElementById('info-white-score');
        whiteScoreElement.textContent = game.white_score;
    
        const ailevelElement = document.getElementById('info-ai-level');
        ailevelElement.textContent = 'Level ' + game.ai_level;
    })
    .catch(error => {
        console.error('Error:', error);
        return null;
    })

    // Get game moves and display them
    fetch(`/get_moves/${gameId}/`)
        .then(response => response.json())
        .then(data => {
            const moves = data.moves;

            for (let i=1; i<moves.length; i++){
                if (moves[i].row == 9 && moves[i].col == 9){
                    addToHistoryTable(animator, -1, -1, logic.history.length, "past-history-table");
                    logic.pass();
                }
                else {
                    addToHistoryTable(animator, moves[i].row, moves[i].col, logic.history.length, "past-history-table");
                    logic.placePiece(moves[i].row, moves[i].col);
                }
            }
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("restart-animation-btn").addEventListener("click", () => animator.restartAnimation());
    document.getElementById("backward-step-btn").addEventListener("click", () => animator.backwardStep());
    document.getElementById("start-animation-btn").addEventListener("click", () => animator.startAnimation());
    document.getElementById("pause-animation-btn").addEventListener("click", () => animator.pauseAnimation());
    document.getElementById("forward-step-btn").addEventListener("click", () => animator.forwardStep());
    document.getElementById("skip-to-end-btn").addEventListener("click", () => animator.skipToEnd());
    document.getElementById('progress').addEventListener("click", (event) => animator.seek(event));
});
