"use strict";

export const sharedState = {
    debug: false,
    // Black:human, White:AI, Black passes at turn #31 and #33
    debugMoves: ['F4', 'D3', 'C4', 'F5', 'D2', 'F3', 'G4', 'E3', 'E2', 'C3', 'C2', 'G5', 'G6', 'F6', 'C5', 'E6', 'F2', 'F1', 'G3', 'E1', 'D1', 'C1', 'G2', 'G1', 'D6', 'H1', 'H2', 'H3', 'H4', 'H5', 'pass', 'H6', 'pass', 'H7', 'G7'],

    favoriteCurrentPage: 1,
    currentPage: 1,
    nextPage: 1,

    settings: undefined,
    board: undefined,
    logic: undefined,
    animator: undefined,

    userInputTitle: undefined,
    userInputDescription: undefined,

    maxTitleLength: 50,
    maxDescriptionLength: 200,
};
