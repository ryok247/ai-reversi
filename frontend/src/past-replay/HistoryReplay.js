import React from 'react';

function HistoryReplay(){
    return (
    <div className="history-replay">
        <div className="info">
            <h4>History</h4>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 400 }}>
        <table className="past-history-table table-striped table-bordered table-sm">
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
    );
}

export default HistoryReplay;