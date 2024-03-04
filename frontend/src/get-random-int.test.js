"use strict";

import { getRandomInt } from "./utilities.js";

const testData = [
  { testCase: "0 <= getRandomInt(5) <= 5", value: 5, expected: [0, 5] },
  { testCase: "0 <= getRandomInt(100) <= 100", value: 100, expected: [0, 100] },
  { testCase: "getRandomInt(0) == 0", value: 0, expected: [0, 0] },
];

testData.forEach((v) => {
  test(`getRandomInt_${v.testCase}`, () => {
    const actual = getRandomInt(v.value);

    expect(actual).toBeGreaterThanOrEqual(v.expected[0]);
    expect(actual).toBeLessThanOrEqual(v.expected[1]);
  });
});
