"use strict";

import { gameState } from './game-state.js';
import { gameSettings } from './game-settings.js';
import { gameHistory } from './game-history.js';
import { boardInfo } from './game-logic.js';
import { getCookie, getCsrfToken } from './utilities.js'

const boardElement = document.querySelector(".board");
const turnElement = document.getElementById("turn");
const confirmedBtnElement = document.getElementById("confirmed-btn");
const historyElement = document.getElementById("history");

function initializeGame(historyElement){

    window.settings = new gameSettings("mode", "color", "level", "highlight");
    window.state = new gameState(turnElement);
    window.gamehistory = new gameHistory(historyElement, window.state);
    window.board = new boardInfo(window.state, window.settings, window.gamehistory, boardElement);

}

document.addEventListener("DOMContentLoaded", () => {

    confirmedBtnElement.addEventListener("click", () => {

        initializeGame(historyElement);

        if (settings.mode == "cp" && settings.color == "white") board.makeComputerMove();
        
        board.highlightPossibleCells();

    });

    initializeGame(historyElement);

});

export function updateGameRecordsWithUser() {
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        const gameIds = JSON.parse(gameHistory);

        // ここでバックエンドにリクエストを送信
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

window.currentPage = 1;
window.nextPage = 1;

export function loadRecentGames(page = 1) {
    fetch(`/user_games/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const recentGamesList = document.getElementById('recent-game-table-body');

            // ログイン状態をチェック
            if (isUserLoggedIn()) {
                // ユーザーがログインしている場合、Favoriteヘッダーを表示
                document.getElementById('favorite-header').style.display = 'table-cell';
            }

            recentGamesList.innerHTML = '';

            data.games.forEach(game => {
                const row = document.createElement('tr');
                row.setAttribute('data-game-id', game.id);

                // ログイン状態に応じてFavoriteカラムを追加
                let favoriteColumn = '';
                if (isUserLoggedIn()) {
                    const starColor = data.is_favorite ? 'orange' : 'grey';
                    favoriteColumn = `
                    <td class="favorite-column" data-game-id="${game.id}">
                        <i class="fa fa-star" style="color: ${starColor};"></i>
                    </td>
                `;
                }

                row.innerHTML = `
                    ${favoriteColumn}
                    <td>${new Date(game.game_datetime).toLocaleDateString()}</td>
                    <td>${new Date(game.game_datetime).toLocaleTimeString()}</td>
                    <td>${game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1)}</td>
                    <td>${game.black_score > game.white_score ? 'Win' : game.black_score < game.white_score ? 'Lose' : 'Draw'}</td>
                    <td>${game.black_score}</td>
                    <td>${game.white_score}</td>
                    <td>Level ${game.ai_level}</td>
                `;

                if (isUserLoggedIn()) {
                    const favoriteCell = row.querySelector('.favorite-column');
                    favoriteCell.addEventListener('click', function() {
                        toggleFavorite(game.id);
                    });
                }

                recentGamesList.appendChild(row);
            });

            window.currentPage = page;

            if (window.currentPage > 1) {
                document.getElementById('load-prev-games').style.display = 'block';
            } else {
                document.getElementById('load-prev-games').style.display = 'none';
            }

            if (data.has_next) {
                window.nextPage = window.currentPage + 1;
                document.getElementById('load-more-games').style.display = 'block';
            } else {
                document.getElementById('load-more-games').style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function loadRecentGamesFromCookie(){
    const gameHistory = getCookie('game_history');
    if (gameHistory) {
        let gameIds = JSON.parse(gameHistory);
        gameIds = [...new Set(gameIds)];
        const recentGamesTableBody = document.getElementById('recent-game-table-body');

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
                const row = document.createElement('tr');
                const gameDate = new Date(game.game_datetime);
                const result = game.black_score > game.white_score 
                               ? (game.player_color === 'black' ? 'Win' : 'Lose')
                               : (game.black_score < game.white_score 
                                  ? (game.player_color === 'white' ? 'Win' : 'Lose')
                                  : 'Draw');
                row.innerHTML = `
                    <td>${gameDate.toLocaleDateString()}</td>
                    <td>${gameDate.toLocaleTimeString()}</td>
                    <td>${game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1)}</td>
                    <td>${result}</td>
                    <td>${game.black_score}</td>
                    <td>${game.white_score}</td>
                    <td>Level ${game.ai_level}</td>
                `;
                recentGamesTableBody.appendChild(row);
            });
        }).catch(error => console.error('Global Error:', error));
    }
}

document.getElementById('load-more-games').addEventListener('click', function() {
    loadRecentGames(window.nextPage);
});

document.getElementById('load-prev-games').addEventListener('click', function() {
    loadRecentGames(window.currentPage - 1);
});

function isUserLoggedIn() {
    return document.getElementById('user-status').innerText === 'Logged In';
}

document.addEventListener('DOMContentLoaded', function() {
    if (isUserLoggedIn()) {
        document.getElementById('favorite-games').style.display = 'block';
        loadFavoriteGames();
        loadRecentGames(window.nextPage);
    } else {
        loadRecentGamesFromCookie();
    }

    /*
    document.querySelectorAll('.toggle-section').forEach(header => {
        header.addEventListener('click', function() {
            const contentId = this.getAttribute('data-target');
            const content = document.getElementById(contentId);
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
    */

    // セクションのトグル機能
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.addEventListener('click', function() {
            const header = this.parentElement;
            const contentId = header.getAttribute('data-target');
            const content = document.getElementById(contentId);
            const isExpanded = content.style.display === 'block';

            // コンテンツの表示/非表示を切り替え
            content.style.display = isExpanded ? 'none' : 'block';
            
            // ボタンのテキストを+/-に切り替え
            this.textContent = isExpanded ? '+' : '-';
        });
    });
    
});

window.favoriteCurrentPage = 1;

export function loadFavoriteGames(page = 1) {
    fetch(`/favorite_games/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const favoriteGamesList = document.getElementById('favorite-game-table-body');
            favoriteGamesList.innerHTML = '';

            data.games.forEach(game => {
                const row = document.createElement('tr');
                row.setAttribute('data-game-id', game.id);

                let favoriteColumn = '';
                if (isUserLoggedIn()) {
                    const starColor = data.is_favorite ? 'orange' : 'grey';
                    favoriteColumn = `
                    <td class="favorite-column" data-game-id="${game.id}">
                        <i class="fa fa-star" style="color: ${starColor};"></i>
                    </td>
                `;
                }

                row.innerHTML = `
                ${favoriteColumn}
                <td>${new Date(game.game_datetime).toLocaleDateString()}</td>
                <td>${new Date(game.game_datetime).toLocaleTimeString()}</td>
                <td>${game.player_color.charAt(0).toUpperCase() + game.player_color.slice(1)}</td>
                <td>${game.black_score > game.white_score ? 'Win' : game.black_score < game.white_score ? 'Lose' : 'Draw'}</td>
                <td>${game.black_score}</td>
                <td>${game.white_score}</td>
                <td>Level ${game.ai_level}</td>
                `;

                if (isUserLoggedIn()) {
                    // 星のアイコンを持つセルにイベントリスナーを追加
                    const favoriteCell = row.querySelector('.favorite-column');
                    favoriteCell.addEventListener('click', function() {
                        toggleFavorite(game.id);
                    });
                }

                favoriteGamesList.appendChild(row);
            });

            window.favoriteCurrentPage = page;

            // ボタンの表示・非表示を管理
            document.getElementById('load-prev-favorite-games').style.display = window.favoriteCurrentPage > 1 ? 'block' : 'none';
            document.getElementById('load-more-favorite-games').style.display = data.has_next ? 'block' : 'none';
        })
        .catch(error => console.error('Error:', error));
    }

// ボタンのイベントリスナーを設定
document.getElementById('load-more-favorite-games').addEventListener('click', function() {
    loadFavoriteGames(window.favoriteCurrentPage + 1);
});

document.getElementById('load-prev-favorite-games').addEventListener('click', function() {
    loadFavoriteGames(window.favoriteCurrentPage - 1);
});

// お気に入りの状態を切り替える関数
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
                // starColor変数の定義をforEachループ内に移動
                const starColor = data.is_favorite ? 'orange' : 'grey';
                cell.innerHTML = `<i class="fa fa-star" style="color: ${starColor};"></i>`;
    
                // お気に入り状態に応じて表を更新
                const isFavorite = data.is_favorite ? 'Yes' : 'No';
                updateFavoriteGamesTable(gameId, isFavorite);
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

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
            // 新しい行の星アイコンにイベントリスナーを設定
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