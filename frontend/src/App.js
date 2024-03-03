import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from './actions/authActions';
import Home from './Home';
import Logout from './auth/Logout';
import PastReplay from './past-replay/PastReplay';
import './App.css';

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/past_replay/:gameId" element={<PastReplay />} />
      </Routes>
    </Router>
  );
}

export default App;
