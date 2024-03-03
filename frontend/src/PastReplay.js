import React from 'react';
import { useParams } from 'react-router-dom';

function PastReplay() {
  const { gameId } = useParams();

  return (
    <div className="container">
        <h1>Replay</h1>
        <input type="hidden" id="game-id" defaultValue="{{ game_id }}" />
        <div className="row">
            <div className="col-md-2 col-12">
            <div className="info">
                <h4>Game Info</h4>
            </div>
            <div className="info">
                Title
                <i id="edit-title-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-title-container">
                <span id="info-title" />
                {/* Input field for editing and save button (initially hidden) */}
                <input type="text" id="edit-title-input" style={{ display: "none" }} />
                <button id="save-title-button" style={{ display: "none" }}>
                Save
                </button>
            </div>
            <div className="info">
                Description
                <i id="edit-description-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-description-container">
                <span id="info-description" />
                <textarea
                id="edit-description-input"
                style={{ display: "none" }}
                defaultValue={""}
                />
                <button id="save-description-button" style={{ display: "none" }}>
                Save
                </button>
            </div>
            <div className="info">Date</div>
            <div id="info-date" />
            <div className="info">Time</div>
            <div id="info-time" />
            <div className="info">Your Color</div>
            <div id="info-color" />
            <div className="info">Result</div>
            <div id="info-result" />
            <div className="info">Black</div>
            <div id="info-black-score" />
            <div className="info">White</div>
            <div id="info-white-score" />
            <div className="info">AI Level</div>
            <div id="info-ai-level" />
            <div className="info">Total User's duration</div>
            <div id="info-duration" />
            </div>
            <div className="col-md-7 col-12">
            <div className="board animated">
                {/* Game board will be generated here. */}
            </div>
            <div className="controls">
                <button
                type="button"
                className="btn btn-primary"
                id="restart-animation-btn"
                >
                <i className="fa-solid fa-backward-fast" />
                </button>
                <button
                type="button"
                className="btn btn-primary"
                id="backward-step-btn"
                >
                <i className="fa-solid fa-backward-step" />
                </button>
                <button
                type="button"
                className="btn btn-primary"
                id="start-animation-btn"
                >
                <i className="fa-solid fa-solid fa-play" />
                </button>
                <button
                type="button"
                className="btn btn-primary"
                id="pause-animation-btn"
                >
                <i className="fa-solid fa-pause" />
                </button>
                <button type="button" className="btn btn-primary" id="forward-step-btn">
                <i className="fa-solid fa-forward-step" />
                </button>
                <button type="button" className="btn btn-primary" id="skip-to-end-btn">
                <i className="fa-solid fa-forward-fast" />
                </button>
            </div>
            <div className="progress-bar">
                <div className="progress" id="progress" />
            </div>
            </div>
            <div className="col-md-3 col-12">
            <div className="history-replay">
                <div className="info">
                <h4>History</h4>
                </div>
                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                <table className="past-history-table table table-striped table-bordered border-primary table-sm">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Player</th>
                        <th scope="col">Position</th>
                        <th scope="col">Time</th>
                    </tr>
                    </thead>
                    <tbody id="replay-table-body">
                    {/* 履歴がここに表示されます */}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        </div>
    </div>

  );
}

export default PastReplay;
