import React from 'react';

function TurnAndScore() {
  return (
    <div>
      <div className="turn subsection">
        <div className="info"><h4>Turn</h4></div>
        <div id="turn">Black</div>
      </div>
      <div className="score subsection">
        <div className="info"><h4>Score</h4></div>
        <div>Black: <span id="black-score">2</span></div>
        <div>White: <span id="white-score">2</span></div>
      </div>
    </div>
  );
}

export default TurnAndScore;
