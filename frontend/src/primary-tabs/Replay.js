import React from 'react';
import ReplayControls from './ReplayControls';
import ReplayHistory from './ReplayHistory';

function Replay() {
  return (
    <div id="Replay" className="tab-content">
      <div className="container">
        <div className="row">
          <div className="col-md-8 col-12">
            <div className="board animated"></div>
            <ReplayControls />
            <div className="progress-bar">
              <div className="progress" id="progress"></div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <ReplayHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Replay;
