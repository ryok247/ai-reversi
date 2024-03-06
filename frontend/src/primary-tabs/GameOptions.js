import React from 'react';
import ModeOption from './ModeOption';
import PlayerOptions from './PlayerOptions';
import LevelOptions from './LevelOptions';
import HighlightOption from './HighlightOption';
import StartButton from './StartButton';
import GameBoard from './GameBoard';
import GameHistory from './GameHistory';
import TurnAndScore from './TurnAndScore';

function GameOptions() {
  return (
    <div id="Game" className="tab-content active">
      <div className="container main-contents">
        <div className="row">
          <div className="col-md-3 col-12">
            <div className="container container-for-options">
              <ModeOption />
              <PlayerOptions />
              <LevelOptions />
              <StartButton />
            </div>
            <HighlightOption />
          </div>
          <div className="col-md-5 col-12">
            <GameBoard className="board"/>
          </div>
          <div className="col-md-4 col-12">
            <div className="container">
              <TurnAndScore />
              <GameHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOptions;
