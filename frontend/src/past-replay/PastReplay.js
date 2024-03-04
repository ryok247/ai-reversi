import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gameLogic } from "../game-logic.js"
import { ReplayAnimator } from '../animation.js';
import { addToHistoryTable, updateGameName } from "../manage-game.js";
import { getCsrfToken } from '../utilities.js'
import { sharedState } from "../game-shared.js";
import GameBoard from '../primary-tabs/GameBoard.js';
import GameInfo from './GameInfo.js';
import ReplayControls from './ReplayControls.js';
import NavigationBar from '../navigation-bar/NavigationBar.js';
import HistoryReplay from './HistoryReplay.js';

// サーバーに新しい説明を送信する関数
function updateGameDescription(gameId, description) {
    return fetch(`/update_game_description/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ description })
    }).then(response => response.json());
}

function PastReplay() {

  const { gameId } = useParams();

  useEffect(() => {

    let logic = new gameLogic();
    const progressElement = document.getElementById('progress');
    const animatedBoardElement = document.querySelector(".board.animated");
    const animator = new ReplayAnimator(logic, animatedBoardElement, progressElement);

    //gameId = document.getElementById('game-id').value;

    // Get game details and display them
    fetch(`/api/get_game_details/${gameId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Game ID ${gameId} not found`);
        }
        return response.json();
    })
    .then(game => {

        const titleElement = document.getElementById('info-title');
        titleElement.textContent = game.name;

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
    
        const blackScoreElement = document.getElementById('info-black-score');
        blackScoreElement.textContent = game.black_score;
    
        const whiteScoreElement = document.getElementById('info-white-score');
        whiteScoreElement.textContent = game.white_score;
    
        const ailevelElement = document.getElementById('info-ai-level');
        ailevelElement.textContent = 'Level ' + game.ai_level;

        const durationElement = document.getElementById('info-duration');
        durationElement.textContent = `${game.total_user_duration / 1000} seconds`;
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
                    addToHistoryTable(animator, -1, -1, logic.history.length, -1, "past-history-table");
                    logic.pass();
                }
                else {
                    addToHistoryTable(animator, moves[i].row, moves[i].col, logic.history.length, moves[i].duration, "past-history-table");
                    logic.placePiece(moves[i].row, moves[i].col);
                }
            }
        })
        .catch(error => console.error('Error:', error));

    document.getElementById("restart-animation-btn").addEventListener("click", () => animator.restartAnimation());
    document.getElementById("backward-step-btn").addEventListener("click", () => animator.backwardStep());
    document.getElementById("start-animation-btn").addEventListener("click", () => animator.startAnimation());
    document.getElementById("pause-animation-btn").addEventListener("click", () => animator.pauseAnimation());
    document.getElementById("forward-step-btn").addEventListener("click", () => animator.forwardStep());
    document.getElementById("skip-to-end-btn").addEventListener("click", () => animator.skipToEnd());
    document.getElementById('progress').addEventListener("click", (event) => animator.seek(event));

    //gameId = document.getElementById('game-id').value;
    const titleElement = document.getElementById('info-title');
    const editIcon = document.getElementById('edit-title-icon');
    const inputElement = document.getElementById('edit-title-input');
    const saveButton = document.getElementById('save-title-button');

    editIcon.addEventListener('click', function() {
        // Display the input field and save button
        inputElement.style.display = 'block';
        saveButton.style.display = 'block';

        // Set the current title to the input field
        inputElement.value = titleElement.textContent;

        // Hide the title element and edit icon
        titleElement.style.display = 'none';
        editIcon.style.display = 'none';
    });

    saveButton.addEventListener('click', function() {
        const newTitle = inputElement.value;

        if (newTitle.length > sharedState.maxTitleLength){
            alert(`Title must be less than ${sharedState.maxTitleLength} characters`);
            return;
        }

        updateGameName(gameId, newTitle, titleElement);

        // Hide the input field and save button
        inputElement.style.display = 'none';
        saveButton.style.display = 'none';

        // Update and display the title element
        titleElement.textContent = newTitle;
        titleElement.style.display = 'block';
        editIcon.style.display = 'block';
    });

    //gameId = document.getElementById('game-id').value;
    const descriptionElement = document.getElementById('info-description');
    const editDescriptionIcon = document.getElementById('edit-description-icon');
    const editDescriptionInput = document.getElementById('edit-description-input');
    const saveDescriptionButton = document.getElementById('save-description-button');

    // ゲームの詳細を取得して表示
    fetch(`/api/get_game_details/${gameId}`)
    .then(response => response.json())
    .then(game => {
        // タイトルと説明を表示
        document.getElementById('info-title').textContent = game.name;
        descriptionElement.textContent = game.description;
        // その他の情報もここで設定
    });

    // 説明編集アイコンのクリックイベント
    editDescriptionIcon.addEventListener('click', function() {
        editDescriptionInput.style.display = 'block';
        saveDescriptionButton.style.display = 'block';
        editDescriptionInput.value = descriptionElement.textContent;
        descriptionElement.style.display = 'none';
        editDescriptionIcon.style.display = 'none';
    });

    // 説明保存ボタンのクリックイベント
    saveDescriptionButton.addEventListener('click', function() {
        const newDescription = editDescriptionInput.value;

        if (newDescription.length > sharedState.maxDescriptionLength){
            alert(`Description must be less than ${sharedState.maxDescriptionLength} characters`);
            return;
        }

        // サーバーに新しい説明を送信
        updateGameDescription(gameId, newDescription).then(() => {
            descriptionElement.textContent = newDescription;
            descriptionElement.style.display = 'block';
            editDescriptionIcon.style.display = 'block';
            editDescriptionInput.style.display = 'none';
            saveDescriptionButton.style.display = 'none';
        });
    });

  }, []);

  return (
    <>
        <NavigationBar />
        <div className="container">
            <h1>Replay: Past Game Highlights</h1>
            <input type="hidden" id="game-id" defaultValue="{{ game_id }}" />
            <div className="row">
                <div className="col-md-2 col-12">
                    <GameInfo />
                </div>
                <div className="col-md-7 col-12">
                    <GameBoard className="board animated" />
                    <ReplayControls />
                    <div className="progress-bar">
                        <div className="progress" id="progress" />
                    </div>
                </div>
                <div className="col-md-3 col-12">
                    <HistoryReplay />
                </div>
            </div>
        </div>
    </>
  );
}

export default PastReplay;
