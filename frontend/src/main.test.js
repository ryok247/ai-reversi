/*
Disable the tests for now, because these functions are now deprecated.

import { loadDashboardData, updateTable } from '../frontend/src/App.js';

// Setup mock for fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ today: [], this_month: [], total: [] }),
  })
);

describe('loadDashboardData', () => {
  beforeEach(() => {
    // Clear mock for fetch
    fetch.mockClear();
  });

  it('fetches data and updates the dashboard', async () => {
    document.body.innerHTML = `
      <table id="ai-results-table-today"><tbody></tbody></table>
      <table id="ai-results-table-month"><tbody></tbody></table>
      <table id="ai-results-table-total"><tbody></tbody></table>
    `;

    await loadDashboardData();

    // Check that fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);

    // Check that the tables were updated
    expect(document.querySelector('#ai-results-table-today tbody').innerHTML).not.toBe('');
  });
});

describe('updateTable', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="ai-results-table-test"><tbody></tbody></table>
    `;
  });

  it('updates table with provided data', () => {
    const tableBody = document.querySelector('#ai-results-table-test tbody');
    updateTable(tableBody, [{ ai_level: 1, wins: 10, losses: 5, draws: 2, fastest_win: 1000 }]);

    expect(tableBody.innerHTML).toContain('10');
    expect(tableBody.innerHTML).toContain('5');
    expect(tableBody.innerHTML).toContain('2');
    expect(tableBody.innerHTML).toContain('1');
  });
});
*/

test('dummy test', () => {
});