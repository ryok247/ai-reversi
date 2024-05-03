import React from 'react';
import { useSelector } from 'react-redux';
import { sharedState } from '../game-shared';

function AIScoreOption() {

  const language = useSelector((state) => state.language.language);

  const changeHandler = () => {
    sharedState.settings.updateSettings("aiscore");

    if (sharedState.settings.aiscore === "checked") sharedState.board.highlightAIScore();
    else sharedState.board.removeAIScore();

  }

  return (
    <div className="container">
      <form action="">
        <input type="checkbox" id="aiscore" name="aiscore" value="checked" onChange={changeHandler} />
        <label htmlFor="aiscore"><h5 id="aiscore-text">{language==="en" ? "Show AI Score" : "AI評価値を表示"}</h5></label>
      </form>
    </div>
  );
}

export default AIScoreOption;