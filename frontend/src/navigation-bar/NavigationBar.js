import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../actions/languageActions';
import LoginModal from '../auth/LoginModal.js';
import SignupModal from '../auth/SignupModal.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

function NavigationBar() {
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isLanguageDropdownOpen]);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleLanguageChange = (selectedLanguage) => {
    dispatch(setLanguage(selectedLanguage));
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
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
                    {language === 'en' ? 'Signup' : '新規登録'}
                  </button>
                </>
              )}
              <div className="nav-item dropdown" ref={dropdownRef}>
                <button className="nav-link dropdown-toggle" onClick={toggleLanguageDropdown}>
                  <FontAwesomeIcon icon={faGlobe} /> {language === 'en' ? 'Language' : '言語'}
                </button>
                {isLanguageDropdownOpen && (
                  <div className="dropdown-menu show">
                    <button className="dropdown-item" onClick={() => handleLanguageChange('en')}>
                      <span className="flag-icon">🇬🇧</span> English
                    </button>
                    <button className="dropdown-item" onClick={() => handleLanguageChange('ja')}>
                      <span className="flag-icon">🇯🇵</span> 日本語
                    </button>
                  </div>
                )}
              </div>
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