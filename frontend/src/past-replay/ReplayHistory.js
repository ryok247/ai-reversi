import React from 'react';

function ReplayHistory() {
  return (
    <div className="history-replay">
      <div className="info"><h4>History</h4></div>
      <div className="overflow-auto" style={{ maxHeight: '400px' }}>
        <table className="history-table table table-striped table-bordered border-primary table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Player</th>
              <th scope="col">Position</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody id="replay-table-body">
            {/* 履歴データがここに挿入されます */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReplayHistory;
