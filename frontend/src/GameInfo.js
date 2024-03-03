import React from "react";
import { isUserLoggedIn } from "./manage-game"

function GameInfo(){
    return (
        <>
            <div className="info">
            <h4>Game Info</h4>
            </div>
            <div className="info" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                Title
                <i id="edit-title-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-title-container" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                <span id="info-title" />
                {/* Input field for editing and save button (initially hidden) */}
                <input type="text" id="edit-title-input" style={{ display: "none" }} />
                <button id="save-title-button" style={{ display: "none" }}>
                Save
                </button>
            </div>
            <div className="info" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                Description
                <i id="edit-description-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-description-container" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
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
    </>
    );
}

export default GameInfo;