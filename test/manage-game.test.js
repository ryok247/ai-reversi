import { boardInfo } from '../loginApp/static/js/manage-game';

describe('boardInfo', () => {
  it('creates a new boardInfo instance', () => {
    // Setup mock for logic and settings
    const logicMock = {
      board: Array(8).fill(Array(8).fill(-1)),
      // Create a mock for the other methods and properties of the logic object if necessary
    };
    const settingsMock = {
      mode: 'cp',
      color: 'black',
      level: 1,
      highlight: true,
      // Create a mock for the other properties of the settings object if necessary
    };

    // Setup DOM elements
    document.body.innerHTML = `
      <div class="board"></div>
      <div id="turn"></div>
    `;

    const boardElement = document.querySelector('.board');
    const turnElement = document.getElementById('turn');
    const historyElement = document.createElement('div');

    const board = new boardInfo(logicMock, settingsMock, boardElement, turnElement, historyElement);

    // Check that the properties of the instance are set correctly
    expect(board).toBeDefined();
    expect(board.boardElement).toBe(boardElement);
    expect(board.turnElement).toBe(turnElement);
    expect(board.historyElement).toBe(historyElement);
    expect(board.logic).toBe(logicMock);
    expect(board.settings).toBe(settingsMock);

    // Check that the methods of the instance exist
    expect(board.placePiece).toBeDefined();
    expect(board.displayTurn).toBeDefined();
    expect(board.displayEnd).toBeDefined();
    expect(board.updateScores).toBeDefined();
    expect(board.cellClickHandler).toBeDefined();
    expect(board.createCellClickHandler).toBeDefined();
    expect(board.makeComputerMove).toBeDefined();
    expect(board.highlightPossibleCells).toBeDefined();
    expect(board.removeHighlight).toBeDefined();
    expect(board.endGame).toBeDefined();
  });
});

jest.mock('../loginApp/static/js/utilities', () => ({
    getCsrfToken: jest.fn().mockReturnValue('fake-csrf-token'),
    makeAsync: jest.fn().mockImplementation(fn => fn),
    getCookie: jest.fn().mockReturnValue(),
    setCookie: jest.fn(),
  }));
  
describe('boardInfo', () => {
  it('saves the game to the database', async () => {
    // Setup mock for fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'success', game_id: '123' }),
      })
    );

    // Create logicMock and settingsMock
    const logicMock = {
      board: Array(8).fill(Array(8).fill(-1)),
      currentPlayer: 0,
      score: [2, 2],
      history: [],
      placePiece: jest.fn(),
      getPossibleMoves: jest.fn(),
    };
    const settingsMock = {
      mode: 'cp',
      color: 'black',
      level: 1,
      highlight: true,
    };

    // Create a boardInfo instance
    const boardElement = document.createElement('div');
    const turnElement = document.createElement('div');
    const historyElement = document.createElement('div');
    const board = new boardInfo(logicMock, settingsMock, boardElement, turnElement, historyElement);

    // Call the save to database function
    await board.saveGameToDatabase();

    // Check that fetch was called with the correct URL and options
    expect(fetch).toHaveBeenCalledWith('/save_game/', {
      method: 'POST',
      body: expect.any(String),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'fake-csrf-token'
      }
    });

    // Check the number of times fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
