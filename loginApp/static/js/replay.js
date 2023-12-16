import { gameLogic } from "./game-logic.js"
import { ReplayAnimator } from './animation.js';
import { addToHistoryTable } from "./manage-game.js";

let logic = new gameLogic();
const progressElement = document.getElementById('progress');
const animatedBoardElement = document.querySelector(".board.animated");
const animator = new ReplayAnimator(logic, animatedBoardElement, progressElement);

document.addEventListener('DOMContentLoaded', function() {
    const gameId = document.getElementById('game-id').value; // ゲームIDを取得

    fetch(`/get_moves/${gameId}/`) // ゲームデータの取得
        .then(response => response.json())
        .then(data => {
            const moves = data.moves;

            // ここでGameLogicインスタンスの更新とリプレイの準備を行う
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
