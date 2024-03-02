import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import store from '../store.js';
import LoginModal from '../auth/LoginModal.js';
import SignupModal from '../auth/SignupModal.js';
import Logout from '../auth/Logout.js';

function NavigationBar() {
  const isLoggedIn = store.getState().auth.isAuthenticated;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/"><h3>AI Reversi</h3></Link>
          <div className="navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav ml-auto">
              {isLoggedIn ? (
                <Link className="nav-item nav-link" to="/logout">Logout</Link>
              ) : (
                <>
                  <button className="nav-item nav-link" onClick={openLoginModal}>Login</button>
                  <button className="nav-item nav-link" onClick={openSignupModal}>Signup</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SignupModal isOpen={isSignupModalOpen} onRequestClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onRequestClose={closeLoginModal} />

      <Routes>
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default NavigationBar;
