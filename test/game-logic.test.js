import { gameLogic, pieceColor } from '../loginApp/static/js/game-logic';

describe('gameLogic class', () => {
  let logic;

  beforeEach(() => {
    // Initialize a gameLogic instance before each test
    logic = new gameLogic();
  });

  test('should initialize with correct starting score', () => {
    // Check that the initial score is 2:2
    expect(logic.getScore()).toEqual([2, 2]);
  });

  test('should place a piece correctly and update the score', () => {
    // Place a black piece at (5, 3) and check that the score is updated
    logic.placePiece(5, 3);
    expect(logic.getScore()).toEqual([4, 1]);
  });

  test('should switch players after a move', () => {
    // Check that the player switches after a move
    const currentPlayerBefore = logic.currentPlayer;
    logic.placePiece(5, 3);
    const currentPlayerAfter = logic.currentPlayer;
    expect(currentPlayerBefore).not.toEqual(currentPlayerAfter);
  });

  test('should detect valid moves', () => {
    // Check that valid moves are detected
    expect(logic.isValidMove(5, 3)).toBe(true);
    expect(logic.isValidMove(0, 0)).toBe(false);
  });

  // Other test cases...
});
