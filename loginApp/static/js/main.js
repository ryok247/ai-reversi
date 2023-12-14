"use strict";

// Importing required modules and components
import { gameState } from './game-state.js';
import { gameSettings } from './game-settings.js';
import { gameHistory } from './game-history.js';
import { boardInfo } from './game-logic.js';
import { getCookie, getCsrfToken } from './utilities.js';
import { sharedState } from './game-shared.js';

// Selecting DOM elements
const boardElement = document.querySelector(".board");
const turnElement = document.getElementById("turn");
const confirmedBtnElement = document.getElementById("confirmed-btn");
const historyElement = document.getElementById("history");

// Function to initialize the game
function initializeGame(historyElement){
    sharedState.settings = new gameSettings("mode", "color", "level", "highlight");
    sharedState.state = new gameState(turnElement);
    sharedState.gamehistory = new gameHistory(historyElement, sharedState.state);
    sharedState.board = new boardInfo(sharedState.state, sharedState.settings, sharedState.gamehistory, boardElement);
}

// Function to check if the user is logged in
function isUserLoggedIn() {
    return document.getElementById('user-status').innerText === 'Logged In';
}

// Function to update game records for the user
export function updateGameRecordsWithUser() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        const gameIds = JSON.parse(gameHistory);

        // Send request to the backend
        fetch('/update_game_records/', {
            method: 'POST',
            body: JSON.stringify({game_ids: gameIds}),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
}

// Function to toggle the favorite status of a game
function toggleFavorite(gameId) {
    fetch(`/toggle_favorite/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const favoriteCells = document.querySelectorAll(`.favorite-column[data-game-id="${gameId}"]`);
            favoriteCells.forEach(cell => {
                const starColor = data.is_favorite ? 'orange' : 'grey';
                cell.innerHTML = `<i class="fa fa-star" style="color: ${starColor};"></i>`;

                // Update the table based on favorite status
                const isFavorite = data.is_favorite ? 'Yes' : 'No';
                updateFavoriteGamesTable(gameId, isFavorite);
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to update the favorite games table
function updateFavoriteGamesTable(gameId, isFavorite) {
    const favoriteGamesTableBody = document.getElementById('favorite-game-table-body');
    const rowInFavoriteGames = favoriteGamesTableBody.querySelector(`tr[data-game-id="${gameId}"]`);
    const rowInRecentGames = document.querySelector(`#recent-game-table-body tr[data-game-id="${gameId}"]`);

    if (!rowInRecentGames) {
        console.error('No corresponding row found in Recent Games');
        return;
    }

    if (isFavorite === 'Yes') {
        if (!rowInFavoriteGames) {
            const newRow = rowInRecentGames.cloneNode(true);
            const newFavoriteCell = newRow.querySelector('.favorite-column');
            newFavoriteCell.addEventListener('click', function() {
                toggleFavorite(gameId);
            });
            favoriteGamesTableBody.appendChild(newRow);
        }
    } else {
        if (rowInFavoriteGames) {
            favoriteGamesTableBody.removeChild(rowInFavoriteGames);
        }
    }
}

// Function to load games (recent or favorite) and populate the table
export function loadGames(type = "recent", page = 1) {
    fetch(`/${type == "recent" ? "user" : "favorite"}_games/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const gamesList = document.getElementById(`${type == "recent" ? "recent" : "favorite"}-game-table-body`);

            // Check if user is logged in
            if (type == "recent" && isUserLoggedIn()) {
                document.getElementById('favorite-header').style.display = 'table-cell';
            }

            gamesList.innerHTML = '';

            data.games.forEach(game => {
                gamesList.appendChild(createRowFromDatabase(game));
            });

            if (type == "recent") {
                sharedState.currentPage = page;
            } else {
                sharedState.favoriteCurrentPage = page;
            }

            // Manage display of buttons
            document.getElementById(`load-prev-${type == "recent" ? "" : "favorite-"}games`).style.display = page > 1 ? 'block' : 'none';
            document.getElementById(`load-more-${type == "recent" ? "" : "favorite-"}games`).style.display = data.has_next ? 'block' : 'none';

            if (data.has_next) {
                if (type == "recent") {
                    sharedState.nextPage = sharedState.currentPage + 1;
                } else {
                    // Handle the next page for favorite games
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to load recent games from the cookie
function loadRecentGamesFromCookie() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        let gameIds = JSON.parse(gameHistory);
        gameIds = [...new Set(gameIds)];
        const recentGamesTableBody = document.getElementById('recent-game-table-body');

        // Fetch and process game details
        const gameDetailsPromises = gameIds.map(gameId => 
            fetch(`/get_game_details/${gameId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Game ID ${gameId} not found`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error:', error);
                    return null;
                })
        );

        Promise.all(gameDetailsPromises).then(games => {
            games = games.filter(game => game !== null);
            games.sort((a, b) => new Date(b.game_datetime) - new Date(a.game_datetime));
            games.forEach(game => {
                recentGamesTableBody.appendChild(createRowFromDatabase(game));
            });
        }).catch(error => console.error('Global Error:', error));
    }
}

// Function to create a table row from game data
function createRowFromDatabase(game) {
    // Initialize a table row and set its data attribute
    const row = document.createElement('tr');
    row.setAttribute('data-game-id', game.id);

    let favoriteColumn = '';
    if (isUserLoggedIn()) {
        const starColor = game.is_favorite ? 'orange' : 'grey';
        favoriteColumn = `
        <td class="favorite-column" data-game-id="${game.id}">
            <i class="fa fa-star" style="color: ${starColor};"></i>
        </td>`;
    }

    // Populate row with game data
    row.innerHTML = `
    ${favoriteColumn}
    <td>${new Date(game.game_datetime).toLocaleDateString()}</td>
    <td>${new Date(game.game_datetime).toLocaleTimeString()}</td>
    <td>${game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1)}</td>
    <td>${game.black_score > game.white_score ? 'Win' : game.black_score < game.white_score ? 'Lose' : 'Draw'}</td>
    <td>${game.black_score}</td>
    <td>${game.white_score}</td>
    <td>Level ${game.ai_level}</td>`;

    if (isUserLoggedIn()) {
        // Add event listener to the favorite cell
        const favoriteCell = row.querySelector('.favorite-column');
        favoriteCell.addEventListener('click', function() {
            toggleFavorite(game.id);
        });
    }
    return row;
}

// Event listeners and function calls
document.addEventListener("DOMContentLoaded", () => {
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
