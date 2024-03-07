import React from "react";
import { useSelector } from "react-redux";
import { isUserLoggedIn } from "../manage-game"

function GameInfo(){

    const language = useSelector((state) => state.language.language);

    return (
        <>
            <div className="info">
            <h4>{language==="en" ? "Game Info" : "ゲームの情報"}</h4>
            </div>
            <div className="info" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                {language==="en" ? "Title" : "タイトル"}
                <i id="edit-title-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-title-container" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                <span id="info-title" />
                {/* Input field for editing and save button (initially hidden) */}
                <input type="text" id="edit-title-input" style={{ display: "none" }} />
                <button id="save-title-button" className="btn-sm btn-primary" style={{ display: "none" }}>
                {language==="en" ? "Save" : "保存"}
                </button>
            </div>
            <div className="info" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                {language==="en" ? "Description": "メモ"}
                <i id="edit-description-icon" className="fa fa-edit edit-icon" />
            </div>
            <div id="info-description-container" style={{ display: isUserLoggedIn() ? 'block' : 'none' }}>
                <span id="info-description" />
                <textarea
                id="edit-description-input"
                style={{ display: "none" }}
                defaultValue={""}
                />
                <button id="save-description-button" className="btn-sm btn-primary" style={{ display: "none" }}>
                {language==="en" ? "Save" : "保存"}
                </button>
            </div>
            <div className="info">{language==="en" ? "Date" : "年月日"}</div>
            <div id="info-date" />
            <div className="info">{language==="en" ? "Time": "時刻"}</div>
            <div id="info-time" />
            <div className="info">{language==="en" ? "Your Color" : "ユーザーの色"}</div>
            <div id="info-color" />
            <div className="info">{language==="en" ? "Result" : "結果"}</div>
            <div id="info-result" />
            <div className="info">{language==="en" ? "Black" : "黒"}</div>
            <div id="info-black-score" />
            <div className="info">{language==="en" ? "White" : "白"}</div>
            <div id="info-white-score" />
            <div className="info">{language==="en" ? "AI Level" : "AIのレベル"}</div>
            <div id="info-ai-level" />
            <div className="info">{language==="en" ? "Total User's duration" : "ユーザーの合計時間"}</div>
            <div id="info-duration" />
    </>
    );
}

export default GameInfo;