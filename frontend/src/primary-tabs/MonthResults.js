import React from 'react';
import { useSelector } from 'react-redux';

function MonthResults() {

  const language = useSelector((state) => state.language.language);

  return (
    <div className="dashboard-element">
      <h3>{language==="en" ? "This Month": "今月"}</h3>
      <table id="ai-results-table-month" className="dashboard-table">
        <thead>
          <tr>
            <th>{language==="en" ? "AI Level" : "AIのレベル"}</th>
            <th>{language==="en" ? "Win" : "勝ち"}</th>
            <th>{language==="en" ? "Lose" : "負け"}</th>
            <th>{language==="en" ? "Draw" : "引き分け"}</th>
            <th>{language==="en" ? "Fastest Win" : "最速の勝ち"}</th>
          </tr>
        </thead>
        <tbody>
          {/* ここにデータをマッピングして行を生成 */}
        </tbody>
      </table>
    </div>
  );
}

  export default MonthResults;