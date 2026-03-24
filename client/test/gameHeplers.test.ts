import { describe, expect, it } from "vitest";
import { getRenderedBoard } from "../src/utils/gameHelpers";
import type { PlayerType } from "../src/utils/types";

const createBoard = (rows: number, cols: number) =>
  Array.from({ length: rows }, () => new Array(cols).fill(0));

const createMockPlayer = (x: number, y: number): PlayerType => ({
  position: { x, y },
  terimino: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    colorClass: "bg-[#FFFF00]",
  },
  collided: false,
});

describe("getRenderedBoard", () => {
  it("renders active piece on board", () => {
    const board = createBoard(20, 10);
    const player = createMockPlayer(0, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer: null,
      modifier: "standard",
    });

    expect(result[0][0]).toBe(0);
    expect(result[1][0]).toBe("bg-[#FFFF00]");
    expect(result[1][1]).toBe("bg-[#FFFF00]");
  });

  it("invisible modifier hides locked cells", () => {
    const board = createBoard(20, 10);
    board[19][0] = "bg-[#00FFFF]";
    const player = createMockPlayer(5, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer: null,
      modifier: "invisible",
    });
    expect(result[19][0]).toBe(0);
  });

  it("standard modifier keeps locked cells visible", () => {
    const board = createBoard(20, 10);
    board[19][0] = "bg-[#00FFFF]";
    const player = createMockPlayer(5, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer: null,
      modifier: "standard",
    });
    expect(result[19][0]).toBe("bg-[#00FFFF]");
  });

  it("renders ghost piece when ghostPlayer provided", () => {
    const board = createBoard(20, 10);
    const player = createMockPlayer(0, 0);
    const ghostPlayer = createMockPlayer(0, 18);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer,
      modifier: "standard",
    });
    expect(result[19][0]).toBe("ghost:bg-[#FFFF00]");
  });

  it("ghost does not overwrite locked cells", () => {
    const board = createBoard(20, 10);
    board[19][0] = "bg-[#00FFFF]";
    const player = createMockPlayer(0, 0);
    const ghostPlayer = createMockPlayer(0, 18);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer,
      modifier: "standard",
    });
    expect(result[19][0]).toBe("bg-[#00FFFF]");
  });

  it("active piece overwrites ghost", () => {
    const board = createBoard(20, 10);
    const player = createMockPlayer(0, 0);
    const ghostPlayer = createMockPlayer(0, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer,
      modifier: "standard",
    });
    expect(result[1][1]).toBe("bg-[#FFFF00]");
  });

  it("no ghost when ghostPlayer is null", () => {
    const board = createBoard(20, 10);
    const player = createMockPlayer(0, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer: null,
      modifier: "standard",
    });
    const hasGhost = result.some((row) =>
      row.some((cell) => typeof cell === "string" && cell.startsWith("ghost:")),
    );
    expect(hasGhost).toBe(false);
  });

  it("returns board with correct dimensions", () => {
    const board = createBoard(20, 10);
    const player = createMockPlayer(0, 0);
    const result = getRenderedBoard({
      board,
      player,
      ghostPlayer: null,
      modifier: "standard",
    });
    expect(result.length).toBe(20);
    expect(result[0].length).toBe(10);
  });
});
