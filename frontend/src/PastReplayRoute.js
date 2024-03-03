import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from './actions/authActions';
import Home from './Home';
import PastReplay from './PastReplay';
import './App.css';
import { sharedState } from './game-shared.js';
import { 
    initializeGame,
    loadGames,
    loadRecentGamesFromCookie, 
    isUserLoggedIn,
    updateGameRecordsWithUser,
 } from './manage-game.js';

function PastReplayRoute() {

  return (
    <Router>
      <Routes>
        <Route path="/past_replay/:gameId" element={<PastReplay />} />
      </Routes>
    </Router>
  );
}

export default PastReplayRoute;
