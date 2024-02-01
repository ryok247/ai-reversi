import { boardInfo } from '../loginApp/static/js/manage-game';

describe('boardInfo', () => {
  it('creates a new boardInfo instance', () => {
    // モックの設定
    const logicMock = {
      board: Array(8).fill(Array(8).fill(-1)), // 仮のボード状態
      // 必要に応じてlogicオブジェクトの他のメソッドやプロパティもモックする
    };
    const settingsMock = {
      mode: 'cp',
      color: 'black',
      level: 1,
      highlight: true,
      // settingsオブジェクトの他のプロパティも必要に応じてモックする
    };

    // DOM要素のセットアップ
    document.body.innerHTML = `
      <div class="board"></div>
      <div id="turn"></div>
    `;

    const boardElement = document.querySelector('.board');
    const turnElement = document.getElementById('turn');
    const historyElement = document.createElement('div');

    const board = new boardInfo(logicMock, settingsMock, boardElement, turnElement, historyElement);

    // インスタンスのプロパティが適切に設定されているか確認
    expect(board).toBeDefined();
    expect(board.boardElement).toBe(boardElement);
    expect(board.turnElement).toBe(turnElement);
    expect(board.historyElement).toBe(historyElement);
    expect(board.logic).toBe(logicMock);
    expect(board.settings).toBe(settingsMock);

    // インスタンスのメソッドが存在するか確認
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
  }));
  
describe('boardInfo', () => {
  it('saves the game to the database', async () => {
    // fetch のモック
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'success', game_id: '123' }),
      })
    );

    // logicMock と settingsMock を作成
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

    // boardInfo インスタンスの作成
    const boardElement = document.createElement('div');
    const turnElement = document.createElement('div');
    const historyElement = document.createElement('div');
    const board = new boardInfo(logicMock, settingsMock, boardElement, turnElement, historyElement);

    // データベース保存関数の呼び出し
    await board.saveGameToDatabase();

    // fetch が適切な URL とオプションで呼び出されたことを確認
    expect(fetch).toHaveBeenCalledWith('/save_game/', {
      method: 'POST',
      body: expect.any(String),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'fake-csrf-token'
      }
    });

    // fetch の呼び出し回数を確認
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
