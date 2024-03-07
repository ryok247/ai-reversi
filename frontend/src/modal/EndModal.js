import React from 'react';
import { useSelector } from 'react-redux';

function EndModal() {

  const language = useSelector((state) => state.language.language);

  const clickHander = () => {
    const modal = document.getElementById('game-end-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  return (
    <div id="game-end-modal" className="modal">
      <div className="modal-content">
        <div id="game-result" />
        <input
          id="game-title-input"
          type="text"
          placeholder="Input the title of the game"
          style={{ display: "none" }}
        />
        <input
          id="game-description-input"
          type="text"
          placeholder="Input the description of the game"
          style={{ display: "none" }}
        />
        {/* Message that contains links to login and signup */}
        <div id="login-signup-message" style={{ display: "none" }}>
          {/*Please <a href="{% url 'login' %}">login</a> or{" "}*/}
          {/*<a href="{% url 'signup' %}">signup</a> to save your game.*/}
        </div>
        <button id="modal-close-btn" onClick={clickHander}>{language==="en" ? "Close": "閉じる"}</button>
      </div>
    </div>
  );
}

export default EndModal;
