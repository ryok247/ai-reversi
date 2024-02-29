import React from 'react';

function MonthResults() {
  
    return (
      <div className="dashboard-element">
        <h3>This Month</h3>
        <table id="ai-results-table-month" className="dashboard-table">
          <thead>
            <tr>
              <th>AI Level</th>
              <th>Win</th>
              <th>Lose</th>
              <th>Draw</th>
              <th>Fastest Win</th>
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