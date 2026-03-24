export type TetriminoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export type BoardCell = number | string;
export type BoardType = BoardCell[][];

export type PlayerAction = "left" | "right" | "down" | "rotate" | "hardDrop";

export interface Tetrimino {
  shape: number[][];
  colorClass: string;
}

export interface PieceType {
  position: { x: number; y: number };
  terimino: Tetrimino;
  collided: boolean;
}

export interface GameState {
  board: BoardType;
  player: PieceType;
  nextPiece?: Tetrimino;
  gameOver: boolean;
  score?: number;
  linesCleared?: number;
  level?: number;
}

export type Spectrum = number[];

export interface SpectrumUpdate {
  playerName: string;
  spectrum: BoardType;
}

export interface ClearLinesResult {
  board: BoardType;
  linesCleared: number;
}
