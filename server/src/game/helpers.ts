import { BOARD_SIZE, TETRIMINOS, DROP_TIME,  } from "./constants";
import type {
  BoardCell,
  BoardType,
  ClearLinesResult,
  PieceType,
  Tetrimino,
  TetriminoType,
} from "./types";

const TETRIMINO_KEYS = Object.keys(TETRIMINOS) as TetriminoType[];

export const createBoard = (rows: number, columns: number): BoardType =>
  Array.from({ length: rows }, () => Array(columns).fill(0));

export const randomTetrimino = (): Tetrimino => {
  const idx = Math.floor(Math.random() * TETRIMINO_KEYS.length);
  const key = TETRIMINO_KEYS[idx];
  return key == null ? TETRIMINOS.I : TETRIMINOS[key];
};

export function getDropTime(level: number, modifier?: string): number {
  if (modifier === "gravity_storm") {
    const time = DROP_TIME.INITIAL / Math.pow(2, level - 1);
    return Math.max(Math.round(time), DROP_TIME.FASTEST);
  }
  // standard / invisible: gentle linear decrease per level
  const time = DROP_TIME.INITIAL - (level - 1) * 75;
  return Math.max(time, DROP_TIME.FASTEST);
}

export const tetriminoAt = (seed: number, index: number): Tetrimino => {
  const keyIndex =
    (Math.abs((seed * 31 + index) | 0)) % TETRIMINO_KEYS.length;
  const key = TETRIMINO_KEYS[keyIndex];
  return key == null ? TETRIMINOS.I : TETRIMINOS[key];
};

export const checkCollision = (
  piece: PieceType,
  board: BoardType,
  { x: moveX, y: moveY }: { x: number; y: number },
): boolean => {
  const shape = piece.terimino.shape;

  for (let y = 0; y < shape.length; y++) {
    const row = shape[y];
    if (!row) continue;

    for (let x = 0; x < row.length; x++) {
      if (row[x] !== 0) {
        const nextY = y + piece.position.y + moveY;
        const nextX = x + piece.position.x + moveX;
        if (
          nextY >= BOARD_SIZE.rows ||
          nextX < 0 ||
          nextX >= BOARD_SIZE.columns ||
          (board[nextY] && board[nextY][nextX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};


export const getGhostPlayer = (
  piece: PieceType,
  board: BoardType,
): PieceType => {
  const ghost = JSON.parse(JSON.stringify(piece));
  while (!checkCollision(ghost, board, { x: 0, y: 1 })) {
    ghost.position.y++;
  }
  return ghost;
};


export const clearLinesWithCount = (board: BoardType): ClearLinesResult => {
  const fullRowsRemoved = board.filter((row) =>
    row.some((cell) => cell === 0 || cell === PENALTY_LINE_PATTERN),
  );
  const linesCleared = BOARD_SIZE.rows - fullRowsRemoved.length;
  const emptyRows = Array.from({ length: linesCleared }, () =>
    new Array(BOARD_SIZE.columns).fill(0),
  );
  return {
    board: [...emptyRows, ...fullRowsRemoved],
    linesCleared,
  };
};

/** Backward-compatible: returns only the board (used by older code paths). */
export const clearLines = (board: BoardType): BoardType =>
  clearLinesWithCount(board).board;



export const getStealthDisplayBoard = (
  board: BoardType,
  player: PieceType,
): BoardType => {
  const display = board.map((row) => row.map(() => 0 as BoardCell));
  const { position, terimino } = player;
  terimino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const bY = y + position.y;
        const bX = x + position.x;
        if (display[bY]?.[bX] !== undefined) {
          display[bY][bX] = terimino.colorClass;
        }
      }
    });
  });
  return display;
};


const PENALTY_LINE_PATTERN = "penalty";
export const addPenaltyLines = (board: BoardType, count: number): BoardType => {
  if (count <= 0) return board.map((row) => [...row]);

  let existingPenaltyCount = 0;
  for (let i = board.length - 1; i >= 0; i--) {
    const row = board[i];
    if (row?.some((cell) => cell === PENALTY_LINE_PATTERN)) {
      existingPenaltyCount++;
    } else {
      break;
    }
  }
  const newPenaltyRows = Array.from({ length: count }, (_, i) => {
    const gapCol = ((i + existingPenaltyCount) * 7) % BOARD_SIZE.columns;
    return Array.from({ length: BOARD_SIZE.columns }, (_, c) =>
      c === gapCol ? 0 : PENALTY_LINE_PATTERN,
    );
  });

  const withoutTop = board.slice(count);

  return [...withoutTop, ...newPenaltyRows];
};
