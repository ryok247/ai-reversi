import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from './actions/authActions';
import NavigationBar from './navigation-bar/NavigationBar';
import PrimaryTabs from './primary-tabs/PrimaryTabs';
import Modal from './modal/Modal';
import { RecentGames, FavoriteGames } from './games/GameTable';
import './App.css';
import { sharedState } from './game-shared.js';
import { 
    initializeGame,
    loadGames, 
    loadRecentGamesFromCookie, 
    isUserLoggedIn,
    updateGameRecordsWithUser,
 } from './manage-game.js';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    fetch('/api/check-auth-status/', {credentials: 'include'})
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Authentication check failed');
      })
      .then(data => {
        if (data.isAuthenticated) {
          // ユーザーがログインしている場合、Reduxストアを更新
          dispatch(loginSuccess(data.user));
        } else {
          // ユーザーがログインしていない場合、Reduxストアを更新
          dispatch(logout());
        }
      })
      .catch(error => console.error('Error:', error));
  }, [dispatch]);  

  useEffect(() => {

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

    // Event listeners for game end modal
    // Commented out for now because it might make users confused
    // When this is uncommented, make sure lines to send data to server should be added
    // When this is uncommented, make sure to uncomment in manage-game.js as well
    
    document.getElementById('modal-close-btn').addEventListener('click', function() {

        document.getElementById('game-end-modal').style.display = 'none';

    });

  }, []);

  return (
    <div>
      <NavigationBar />
      <PrimaryTabs />
      <Modal />
      <FavoriteGames games={[]} />
      <RecentGames games={[]} />
    </div>
  );
}

export default App;
