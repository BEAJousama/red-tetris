import { DEFAULT_LEVEL, LINES_PER_LEVEL, levelForLines, scoreForLines } from "game/scoring";

describe("scoring", () => {
  it("levelForLines respects DEFAULT_LEVEL and LINES_PER_LEVEL", () => {
    expect(levelForLines(0)).toBe(DEFAULT_LEVEL);
    expect(levelForLines(LINES_PER_LEVEL - 1)).toBe(DEFAULT_LEVEL);
    expect(levelForLines(LINES_PER_LEVEL)).toBe(DEFAULT_LEVEL + 1);
    expect(levelForLines(LINES_PER_LEVEL * 3)).toBe(DEFAULT_LEVEL + 3);
  });

  it("scoreForLines returns 0 for non-positive clears", () => {
    expect(scoreForLines(0)).toBe(0);
    expect(scoreForLines(-1)).toBe(0);
  });

  it("scoreForLines uses classic Tetris table, scaled by level", () => {
    expect(scoreForLines(1, 1)).toBe(100);
    expect(scoreForLines(2, 1)).toBe(300);
    expect(scoreForLines(3, 1)).toBe(500);
    expect(scoreForLines(4, 1)).toBe(800);

    // With higher level
    expect(scoreForLines(1, 3)).toBe(300);
    expect(scoreForLines(4, 2)).toBe(1600);
  });

  it("scoreForLines falls back to linear scoring for >4 lines", () => {
    expect(scoreForLines(5, 1)).toBe(500);
    expect(scoreForLines(6, 2)).toBe(1200);
  });
});
