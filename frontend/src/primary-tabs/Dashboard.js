import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import TodayResults from './TodayResults';
import MonthResults from './MonthResults';
import TotalResults from './TotalResults';

export async function loadDashboardData() {
  try {
      const response = await fetch('/api/dashboard/');
      const data = await response.json();
      updateDashboardTable(data);
  } catch (error) {
      console.error('Error:', error);
  }
}

function updateDashboardTable(data) {
  // Get the table bodies for each time period
  const todayTableBody = document.getElementById('ai-results-table-today').querySelector('tbody');
  const monthTableBody = document.getElementById('ai-results-table-month').querySelector('tbody');
  const totalTableBody = document.getElementById('ai-results-table-total').querySelector('tbody');

  // Update data for each time period
  updateTable(todayTableBody, data['today'] || []);
  updateTable(monthTableBody, data['this_month'] || []);
  updateTable(totalTableBody, data['total'] || []);
}

export function updateTable(tableBody, results) {
  tableBody.innerHTML = ''; // Clear table body

  // Make sure there is a result for each AI level
  for (let level = 1; level <= 3; level++) {
      if (!results.some(result => result.ai_level === level)) {
          results.push({ai_level: level, wins: 0, losses: 0, draws: 0, fastest_win: null});
      }
  }

  // Sort results by AI level
  results.sort((a, b) => a.ai_level - b.ai_level); 

  const levelToText = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Medium',
  };

  // Add results to table
  results.forEach(result => {
      const row = tableBody.insertRow();
      row.insertCell(0).textContent = levelToText[result.ai_level];
      row.insertCell(1).textContent = result.wins;
      row.insertCell(2).textContent = result.losses;
      row.insertCell(3).textContent = result.draws;
      row.insertCell(4).textContent = result.fastest_win !== null ? (result.fastest_win / 1000).toFixed(3) : '-';
  });
}

function Dashboard() {

  const language = useSelector((state) => state.language.language);

  useEffect(() => {
    const dashboardTab = document.getElementById('dashboard-tab');
    dashboardTab.addEventListener('click', loadDashboardData);
  }, []);

  return (
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div id="Dashboard" className="tab-content">
            <h2>{language==="en" ? "Performance" : "パフォーマンス"}</h2>
            <div id="dashboard-tab" style={{ overflowX: 'auto' }}>
              <TodayResults />
              <MonthResults />
              <TotalResults />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;