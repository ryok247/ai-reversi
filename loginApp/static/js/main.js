"use strict";

// Importing required modules and components
import { sharedState } from './game-shared.js';
import { ReplayAnimator } from './animation.js';
import { 
    initializeGame,
    loadGames, 
    loadRecentGamesFromCookie, 
    isUserLoggedIn,
 } from './manage-game.js';

// Event listeners and function calls
document.addEventListener("DOMContentLoaded", () => {
    const confirmedBtnElement = document.getElementById("confirmed-btn");
    const historyElement = document.getElementById("history");

    // Initialize game on page load
    confirmedBtnElement.addEventListener("click", () => {
        initializeGame(historyElement);
        // Check game mode and make a computer move if necessary
        if (settings.mode == "cp" && settings.color == "white") board.makeComputerMove();
        // Highlight possible cells
        board.highlightPossibleCells();
    });
    initializeGame(historyElement);
});

document.addEventListener('DOMContentLoaded', function() {

    const progressElement = document.getElementById('progress');
    const animatedBoardElement = document.querySelector(".board.animated");

    sharedState.animator = new ReplayAnimator(sharedState.logic, animatedBoardElement, progressElement);

    document.getElementById("restart-animation-btn").addEventListener("click", () => sharedState.animator.restartAnimation());
    document.getElementById("backward-step-btn").addEventListener("click", () => sharedState.animator.backwardStep());
    document.getElementById("start-animation-btn").addEventListener("click", () => sharedState.animator.startAnimation());
    document.getElementById("pause-animation-btn").addEventListener("click", () => sharedState.animator.pauseAnimation());
    document.getElementById("forward-step-btn").addEventListener("click", () => sharedState.animator.forwardStep());
    document.getElementById("skip-to-end-btn").addEventListener("click", () => sharedState.animator.skipToEnd());
    document.getElementById('progress').addEventListener("click", (event) => sharedState.animator.seek(event));
});

// Event listeners for loading more games
document.getElementById('load-more-games').addEventListener('click',    function() {
    loadGames('recent', sharedState.nextPage);
});

document.getElementById('load-prev-games').addEventListener('click', function() {
loadGames('recent', sharedState.currentPage - 1);
});

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
if (isUserLoggedIn()) {
    document.getElementById('favorite-games').style.display = 'block';
    loadGames('favorite');
    loadGames('recent', sharedState.nextPage);
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
});

// Event listeners for favorite games buttons
document.getElementById('load-more-favorite-games').addEventListener('click', function() {
loadGames('favorite', sharedState.favoriteCurrentPage + 1);
});

document.getElementById('load-prev-favorite-games').addEventListener('click', function() {
loadGames('favorite', sharedState.favoriteCurrentPage - 1);
});
