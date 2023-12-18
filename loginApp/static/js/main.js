"use strict";

// Importing required modules and components
import { sharedState } from './game-shared.js';
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
    confirmedBtnElement.addEventListener("click", async () => {
        initializeGame(historyElement);
        // Check game mode and make a computer move if necessary
        if (sharedState.settings.mode == "cp" && sharedState.settings.color == "white") await sharedState.board.makeComputerMove();
        // Highlight possible cells
        sharedState.board.highlightPossibleCells();
    });
    initializeGame(historyElement);
});

document.addEventListener('DOMContentLoaded', function() {
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
    document.getElementById('dashboard-tab').style.display = 'block';
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

document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard-tab');
    dashboardTab.addEventListener('click', loadDashboardData);
});

function loadDashboardData() {
    fetch('/dashboard/')
        .then(response => response.json())
        .then(data => updateDashboardTable(data))
        .catch(error => console.error('Error:', error));
}

function updateDashboardTable(data) {
    // 各期間のテーブルのbodyを取得
    const todayTableBody = document.getElementById('ai-results-table-today').querySelector('tbody');
    const monthTableBody = document.getElementById('ai-results-table-month').querySelector('tbody');
    const totalTableBody = document.getElementById('ai-results-table-total').querySelector('tbody');

    // 各期間のデータを更新
    updateTable(todayTableBody, data['today'] || []);
    updateTable(monthTableBody, data['this_month'] || []);
    updateTable(totalTableBody, data['total'] || []);
}

function updateTable(tableBody, results) {
    tableBody.innerHTML = ''; // 既存の行をクリア

    // AIレベルが存在することを保証
    for (let level = 1; level <= 3; level++) {
        if (!results.some(result => result.ai_level === level)) {
            results.push({ai_level: level, wins: 0, losses: 0, draws: 0});
        }
    }

    // AIレベルでソート
    results.sort((a, b) => a.ai_level - b.ai_level);

    // テーブルにデータを追加
    results.forEach(result => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = `Level ${result.ai_level}`;
        row.insertCell(1).textContent = result.wins;
        row.insertCell(2).textContent = result.losses;
        row.insertCell(3).textContent = result.draws;
    });
}
