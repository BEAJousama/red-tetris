import type { Tetrimino, TetriminoType } from "./types";

export const BOARD_SIZE = {
  rows: 20,
  columns: 10,
} as const;

export const DROP_TIME = {
  INITIAL: 1000,
  FASTEST: 125,
} as const;

export const INITIAL_PLAYER_POSITION = {
  x: Math.floor(BOARD_SIZE.columns / 2) - 1,
  y: -2,
} as const;

/** Ticks to wait before locking after piece touches pile. */
export const LOCK_DELAY_TICKS = 1 as const;

export const TETRIMINOS: Record<TetriminoType, Tetrimino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    colorClass: "bg-[#00FFFF]",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: "bg-[#0000FF]",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: "bg-[#FFAA00]",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    colorClass: "bg-[#FFFF00]",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    colorClass: "bg-[#00FF00]",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colorClass: "bg-[#9900FF]",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    colorClass: "bg-[#FF0000]",
  },
};
