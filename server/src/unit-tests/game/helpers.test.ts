import {
  addPenaltyLines,
  createBoard,
  tetriminoAt,
  clearLinesWithCount,
  checkCollision,
  getGhostPlayer,
} from "game/helpers";
import { BOARD_SIZE } from "game/constants";
import type { BoardType, PieceType } from "game/types";

describe("createBoard", () => {
  it("returns 2D array of zeros with given dimensions", () => {
    const board = createBoard(3, 4);
    expect(board).toHaveLength(3);
    expect(board[0]).toHaveLength(4);
    expect(board.flat().every((c) => c === 0)).toBe(true);
  });
});

describe("tetriminoAt", () => {
  it("returns same tetrimino for same seed and index", () => {
    const a = tetriminoAt(42, 0);
    const b = tetriminoAt(42, 0);
    expect(a.shape).toEqual(b.shape);
    expect(a.colorClass).toBe(b.colorClass);
  });

  it("returns different tetriminos for different indices", () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(JSON.stringify(tetriminoAt(1, i).shape));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("checkCollision", () => {
  const basePlayer: PieceType = {
    position: { x: 0, y: 0 },
    terimino: { shape: [[1]], colorClass: "x" },
    collided: false,
  };

  it("returns true when moving into wall (left)", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const player = { ...basePlayer, position: { x: 0, y: 5 } };
    expect(checkCollision(player, board, { x: -1, y: 0 })).toBe(true);
  });

  it("returns true when moving into floor", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const player = {
      ...basePlayer,
      position: { x: 5, y: BOARD_SIZE.rows - 1 },
    };
    expect(checkCollision(player, board, { x: 0, y: 1 })).toBe(true);
  });

  it("returns false when move is valid", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const player = { ...basePlayer, position: { x: 5, y: 5 } };
    expect(checkCollision(player, board, { x: 1, y: 0 })).toBe(false);
  });
});

describe("getGhostPlayer", () => {
  it("returns player with position at drop shadow (bottom)", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const player: PieceType = {
      position: { x: 4, y: 5 },
      terimino: { shape: [[1]], colorClass: "x" },
      collided: false,
    };
    const ghost = getGhostPlayer(player, board);
    expect(ghost.position.x).toBe(4);
    expect(ghost.position.y).toBe(BOARD_SIZE.rows - 1);
    expect(ghost.terimino).toEqual(player.terimino);
  });

  it("does not mutate original player", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const player: PieceType = {
      position: { x: 3, y: 10 },
      terimino: { shape: [[1, 1]], colorClass: "y" },
      collided: false,
    };
    const origY = player.position.y;
    getGhostPlayer(player, board);
    expect(player.position.y).toBe(origY);
  });
});

describe("clearLinesWithCount", () => {
  it("returns board and linesCleared for a single full row", () => {
    const board: BoardType = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    for (let c = 0; c < BOARD_SIZE.columns; c++) {
      board[BOARD_SIZE.rows - 1][c] = "filled";
    }
    const { board: out, linesCleared } = clearLinesWithCount(board);
    expect(linesCleared).toBe(1);
    expect(out).toHaveLength(BOARD_SIZE.rows);
  });

  it("removes multiple full rows and adds empty at top", () => {
    const board: BoardType = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    // Make bottom two rows full
    for (let c = 0; c < BOARD_SIZE.columns; c++) {
      board[BOARD_SIZE.rows - 1][c] = "filled";
      board[BOARD_SIZE.rows - 2][c] = "filled";
    }
    const { board: out, linesCleared } = clearLinesWithCount(board);
    expect(linesCleared).toBe(2);
    expect(out).toHaveLength(BOARD_SIZE.rows);
  });
});

describe("addPenaltyLines", () => {
  it("adds count lines at bottom with one gap per line", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const out = addPenaltyLines(board, 2);
    expect(out).toHaveLength(BOARD_SIZE.rows);
    // Penalty lines should be at the BOTTOM, pushing content up
    const bottomRows = out.slice(BOARD_SIZE.rows - 2);
    expect(bottomRows).toHaveLength(2);
    bottomRows.forEach((row) => {
      const filled = row?.filter((c) => c !== 0).length ?? 0;
      expect(filled).toBe(BOARD_SIZE.columns - 1);
    });
  });

  it("pushes existing content up when adding penalties", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    // Fill row 15
    board[15] = board[15].map(() => "filled");
    // Add 1 penalty - should push content from row 15 to row 14
    const out = addPenaltyLines(board, 1);
    expect(out[14].every((c) => c === "filled")).toBe(true);
    expect(out[19].some((c) => c === "penalty")).toBe(true);
  });

  it("stacks new penalties at bottom when applied twice", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    let out = addPenaltyLines(board, 1);
    expect(out[19].some((c) => c === "penalty")).toBe(true);
    out = addPenaltyLines(out, 1);
    expect(out[18].some((c) => c === "penalty")).toBe(true);
    expect(out[19].some((c) => c === "penalty")).toBe(true);
  });

  it("returns copy when count <= 0", () => {
    const board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const out = addPenaltyLines(board, 0);
    expect(out).not.toBe(board);
    expect(out).toEqual(board);
  });
});
