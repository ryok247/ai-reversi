import React from 'react';
import { sharedState } from '../game-shared';

function HighlightOption() {

  const changeHandler = () => {
    sharedState.settings.updateSettings("highlight");

    if (sharedState.settings.highlight == "checked") sharedState.board.highlightPossibleCells();
    else sharedState.board.removeHighlight();

  }

  return (
    <div className="container">
      <form action="">
        <input type="checkbox" id="highlight" name="highlight" value="checked" onChange={changeHandler} defaultChecked />
        <label htmlFor="highlight"><h5 id="highlight-text">Highlight cells</h5></label>
      </form>
    </div>
  );
}

export default HighlightOption;