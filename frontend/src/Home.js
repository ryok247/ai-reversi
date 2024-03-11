import React, { useEffect } from 'react';
import ProgressBarComponent from './ProgressBarComponent';
import NavigationBar from './navigation-bar/NavigationBar';
import PrimaryTabs from './primary-tabs/PrimaryTabs';
import Modal from './modal/EndModal.js';
import { RecentGames, FavoriteGames } from './games/GameTable';
import './App.css';
import { sharedState } from './game-shared.js';
import { 
    initializeGame,
    loadGames,
    loadRecentGamesFromCookie, 
    isUserLoggedIn,
    updateGameRecordsWithUser,
    enableEditing
 } from './manage-game.js';
import { loadModel } from './tensorflow/tensorflow.js';

function Home() {

    useEffect(() => {

      loadModel();

        // CSRFトークンを取得してステートに保存する処理
        fetch('/api/csrf/', {
            credentials: 'include', // 必要に応じて設定
          }).then(response => {
            // CSRFトークンはクッキーに設定されているため、
            // ここでは特にレスポンスボディからトークンを取得する必要はない
            console.log('CSRF token has been set');
          }).catch(error => console.error('Error:', error));
    
        const confirmedBtnElement = document.getElementById("confirmed-btn");
        const historyElement = document.getElementById("history");
    
    
        // Initialize game on page load
        confirmedBtnElement.addEventListener("click", async () => {
            initializeGame(historyElement);
            // Check game mode and make a computer move if necessary
            if (sharedState.settings.mode == "cp" && sharedState.settings.color == "white") await sharedState.board.makeComputerMove();
            // Highlight possible cells
            sharedState.board.highlightPossibleCells();
        });
        initializeGame(historyElement);
        
        document.getElementById('highlight').addEventListener('change', () => {
            sharedState.settings.updateSettings("highlight");
        });
    
        document.getElementById("restart-animation-btn").addEventListener("click", () => sharedState.animator.restartAnimation());
        document.getElementById("backward-step-btn").addEventListener("click", () => sharedState.animator.backwardStep());
        document.getElementById("start-animation-btn").addEventListener("click", () => sharedState.animator.startAnimation());
        document.getElementById("pause-animation-btn").addEventListener("click", () => sharedState.animator.pauseAnimation());
        document.getElementById("forward-step-btn").addEventListener("click", () => sharedState.animator.forwardStep());
        document.getElementById("skip-to-end-btn").addEventListener("click", () => sharedState.animator.skipToEnd());
        document.getElementById('progress').addEventListener("click", (event) => sharedState.animator.seek(event));
    
        if (isUserLoggedIn()) {
            document.getElementById('dashboard-tab').style.display = 'block';
            document.getElementById('favorite-games').style.display = 'block';
            loadGames('favorite');
            loadGames('recent');
            updateGameRecordsWithUser();
        } else {
            loadRecentGamesFromCookie();
        }
    
        // Toggle functionality for sections
        document.querySelectorAll('.toggle-button').forEach(button => {
            button.addEventListener('click', function() {
                const header = this.parentElement;
                const contentId = header.getAttribute('data-target');
                const content = document.getElementById(contentId);
                const isExpanded = content.style.display === 'block';
    
                // Toggle display of content
                content.style.display = isExpanded ? 'none' : 'block';
                
                // Change button text based on state
                this.textContent = isExpanded ? '+' : '-';
            });
          });

  document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const gameId = icon.closest('tr').dataset.gameId;
        const nameColumn = icon.closest('tr').children[2]; // Assuming name is the 3rd column
        const isFavorite = icon.closest('table').id.includes('favorite');
        enableEditing(gameId, nameColumn, isFavorite);
    });
  });

  fetch('/api/settings')
      .then(response => response.json())
      .then(data => {
          // Use the settings retrieved here
          sharedState.maxTitleLength = data.max_title_length;
          sharedState.maxDescriptionLength = data.max_description_length;
      })
      .catch(error => console.error('Error:', error));
    
  }, []);

  return (
    <div>
      <ProgressBarComponent />
      <NavigationBar />
      <PrimaryTabs />
      <Modal />
      <FavoriteGames games={[]} />
      <RecentGames games={[]} />
    </div>
  );
}

export default Home;
