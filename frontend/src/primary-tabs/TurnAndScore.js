import React from 'react';
import { useSelector } from 'react-redux';

function TurnAndScore() {
  const language = useSelector((state) => state.language.language);
  return (
    <div>
      <div className="turn subsection">
        <div className="info"><h4>{language==="en" ? "Turn" : "手番"}</h4></div>
        <div id="turn">{language==="en" ? "Black" : "黒"}</div>
      </div>
      <div className="score subsection">
        <div className="info"><h4>{language==="en" ? "Score" : "スコア"}</h4></div>
        <div>{language==="en" ? "Black: " : "黒: "}<span id="black-score">2</span></div>
        <div>{language==="en" ? "White: " : "白: "}<span id="white-score">2</span></div>
      </div>
    </div>
  );
}

export default TurnAndScore;
