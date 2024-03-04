import React from 'react';
import TodayResults from './TodayResults';
import MonthResults from './MonthResults';
import TotalResults from './TotalResults';

function Dashboard() {
  return (
    <div id="Dashboard" className="tab-content">
      <h2>Performance</h2>
      <div id="dashboard-tab" style={{ overflowX: 'auto' }}>
        <TodayResults />
        <MonthResults />
        <TotalResults />
      </div>
    </div>
  );
}

export default Dashboard;