import React from 'react';
import { useSelector } from 'react-redux';

function HistoryReplay(){

    const language = useSelector((state) => state.language.language);

    return (
    <div className="history-replay">
        <div className="info">
            <h4>{language==="en" ? "History": "履歴"}</h4>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 400 }}>
        <table id="past-history-table" className="past-history-table table-striped table-bordered table-sm">
            <thead>
                <tr>
                    <th scope="col">No.</th>
                    <th scope="col">{language==="en" ? "Player" : "プレイヤー"}</th>
                    <th scope="col">{language==="en" ? "Position" : "位置"}</th>
                    <th scope="col">{language==="en" ? "Time" : "時間"}</th>
                </tr>
            </thead>
            <tbody id="replay-table-body">
                {/* 履歴がここに表示されます */}
            </tbody>
        </table>
        </div>
        <div className="attention">
            <h6>{language==="en" ? "Click each row!" : "行をクリックしてみましょう！"}</h6>
        </div>
    </div>
    );
}

export default HistoryReplay;