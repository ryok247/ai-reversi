import React from 'react';
import { useSelector } from 'react-redux';
import { initializeGame } from '../manage-game';
import { sharedState } from '../game-shared';

function StartButton() {

  const language = useSelector((state) => state.language.language);

  const clickHander = async () => {
    const historyElement = document.getElementById("history");
    initializeGame(historyElement);
    // Check game mode and make a computer move if necessary
    if (sharedState.settings.mode == "cp" && sharedState.settings.color == "white") await sharedState.board.makeComputerMove();
    sharedState.board.highlightPossibleCells();
  };

  return (
    <div className="container-for-button">
      <button type="button" className="btn btn-primary" id="confirmed-btn" onClick={clickHander}>{language==="en" ? "START" : "スタート"}</button>
    </div>
  );
}

export default StartButton;