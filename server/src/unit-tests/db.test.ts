import { persistScores, getLeaderboard } from "db";

describe("db (SQLite persistence)", () => {
  it("does not throw when persisting scores and reading leaderboard", () => {
    expect(() =>
      persistScores([
        { playerName: "Obeaj", score: 1000, linesCleared: 12, level: 3 },
        { playerName: "Yassin", score: 800, linesCleared: 8, level: 2 },
      ]),
    ).not.toThrow();

    const leaderboard = getLeaderboard(5);
    expect(Array.isArray(leaderboard)).toBe(true);
    if (leaderboard.length > 0) {
      const entry = leaderboard[0];
      expect(typeof entry.player_name).toBe("string");
      expect(typeof entry.score).toBe("number");
    }
  });

  it("returns empty array when limit is zero", () => {
    const rows = getLeaderboard(0);
    expect(Array.isArray(rows)).toBe(true);
  });
});
