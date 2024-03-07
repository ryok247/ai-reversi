import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../actions/languageActions';
import LoginModal from '../auth/LoginModal.js';
import SignupModal from '../auth/SignupModal.js';

function NavigationBar() {
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleLanguageChange = (selectedLanguage) => {
    dispatch(setLanguage(selectedLanguage));
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <h3>AI Reversi</h3>
          </Link>
          <div className="navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav ml-auto">
              {isLoggedIn ? (
                <Link className="nav-item nav-link" to="/logout">
                  {language === 'en' ? 'Logout' : 'ログアウト'}
                </Link>
              ) : (
                <>
                  <button className="nav-item nav-link" onClick={openLoginModal}>
                    {language === 'en' ? 'Login' : 'ログイン'}
                  </button>
                  <button className="nav-item nav-link" onClick={openSignupModal}>
                    {language === 'en' ? 'Signup' : '登録'}
                  </button>
                </>
              )}
              <button
                className="nav-item nav-link"
                onClick={() => handleLanguageChange(language === 'en' ? 'ja' : 'en')}
              >
                {language === 'en' ? '日本語' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <SignupModal isOpen={isSignupModalOpen} onRequestClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onRequestClose={closeLoginModal} />
    </div>
  );
}

export default NavigationBar;
