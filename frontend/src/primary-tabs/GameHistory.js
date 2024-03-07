import React from 'react';
import { useSelector } from 'react-redux';

function GameHistory() {

  const language = useSelector((state) => state.language.language);

  return (
    <div className="history subsection">
      <div className="info"><h4>{language==="en" ? "History" : "履歴"}</h4></div>
      <div className="overflow-auto" style={{ maxHeight: '200px' }}>
        <table className="history-table table-striped table-bordered table-sm">
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">{language==="en" ? "Player" : "プレイヤー"}</th>
              <th scope="col">{language==="en" ? "Position" : "位置"}</th>
              <th scope="col">{language==="en" ? "Time" : "時間"}</th>
            </tr>
          </thead>
          <tbody>
            {/* 履歴データがここに挿入されます */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameHistory;
