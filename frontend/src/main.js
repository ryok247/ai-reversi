"use strict";

// Importing required modules and components
import { sharedState } from './game-shared.js';
import { 
    initializeGame,
    loadGames, 
    loadRecentGamesFromCookie, 
    isUserLoggedIn,
    enableEditing,
    updateGameRecordsWithUser,
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

        /*
        sharedState.userInputTitle = document.getElementById('game-title-input').value || "Untitled";
        sharedState.userInputDescription = document.getElementById('game-description-input').value || "";

        if (sharedState.userInputTitle.length > sharedState.maxTitleLength){
            alert(`Title must be less than ${sharedState.maxTitleLength} characters`);
            return;
        }

        if (sharedState.userInputDescription.length > sharedState.maxDescriptionLength){
            alert(`Description must be less than ${sharedState.maxDescriptionLength} characters`);
            return;
        }

        // -- lines to send data to server should be added here --

        document.getElementById('game-title-input').value = ''; // Reset title input
        document.getElementById('game-description-input').value = ''; // Reset description input

        */

        document.getElementById('game-end-modal').style.display = 'none';

    });
});

document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard-tab');
    dashboardTab.addEventListener('click', loadDashboardData);
});

export async function loadDashboardData() {
    try {
        const response = await fetch('/dashboard/');
        const data = await response.json();
        updateDashboardTable(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateDashboardTable(data) {
    // Get the table bodies for each time period
    const todayTableBody = document.getElementById('ai-results-table-today').querySelector('tbody');
    const monthTableBody = document.getElementById('ai-results-table-month').querySelector('tbody');
    const totalTableBody = document.getElementById('ai-results-table-total').querySelector('tbody');

    // Update data for each time period
    updateTable(todayTableBody, data['today'] || []);
    updateTable(monthTableBody, data['this_month'] || []);
    updateTable(totalTableBody, data['total'] || []);
}

export function updateTable(tableBody, results) {
    tableBody.innerHTML = ''; // Clear table body

    // Make sure there is a result for each AI level
    for (let level = 1; level <= 3; level++) {
        if (!results.some(result => result.ai_level === level)) {
            results.push({ai_level: level, wins: 0, losses: 0, draws: 0, fastest_win: null});
        }
    }

    // Sort results by AI level
    results.sort((a, b) => a.ai_level - b.ai_level); 

    const levelToText = {
        1: 'Very Easy',
        2: 'Easy',
        3: 'Medium',
    };

    // Add results to table
    results.forEach(result => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = levelToText[result.ai_level];
        row.insertCell(1).textContent = result.wins;
        row.insertCell(2).textContent = result.losses;
        row.insertCell(3).textContent = result.draws;
        row.insertCell(4).textContent = result.fastest_win !== null ? (result.fastest_win / 1000).toFixed(3) : '-';
    });
}

// Example for attaching event listeners
document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const gameId = icon.closest('tr').dataset.gameId;
        const nameColumn = icon.closest('tr').children[2]; // Assuming name is the 3rd column
        const isFavorite = icon.closest('table').id.includes('favorite');
        enableEditing(gameId, nameColumn, isFavorite);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/settings')
        .then(response => response.json())
        .then(data => {
            // Use the settings retrieved here
            sharedState.maxTitleLength = data.max_title_length;
            sharedState.maxDescriptionLength = data.max_description_length;
        })
        .catch(error => console.error('Error:', error));
});