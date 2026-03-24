import {
  BOARD_SIZE,
  INITIAL_PLAYER_POSITION,
  LOCK_DELAY_TICKS,
} from "./constants";
import {
  addPenaltyLines,
  checkCollision,
  clearLinesWithCount,
  createBoard,
  randomTetrimino,
  getDropTime
} from "./helpers";
import { DEFAULT_LEVEL, levelForLines, scoreForLines } from "./scoring";
import type {
  BoardType,
  GameState,
  PlayerAction,
  PieceType,
  Tetrimino,
} from "./types";

export type MoveDirection = "left" | "right" | "down";

export interface GameEngineOptions {
  getNextPiece?: () => Tetrimino;
  onLinesCleared?: (linesCleared: number) => void;
  onDropTimeChange?: (newDropTime: number) => void;
  modifier?: string;
}


export class GameEngine {
  private board!: BoardType;
  private piece!: PieceType;
  private nextTetrimino: Tetrimino = randomTetrimino();
  private gameOver = false;
  private lockCountdown = 0;
  private score = 0;
  private linesClearedTotal = 0;
  private level = DEFAULT_LEVEL;
  private readonly options: GameEngineOptions;

  constructor(options: GameEngineOptions = {}) {
    this.options = options;
    // this.createGame();
  }

  getState(): GameState {
    return {
      board: this.board.map((row) => [...row]),
      player: { ...this.piece, terimino: { ...this.piece.terimino } },
      nextPiece: {
        ...this.nextTetrimino,
        shape: this.nextTetrimino.shape.map((row) => [...row]),
      },
      gameOver: this.gameOver,
      score: this.score,
      linesCleared: this.linesClearedTotal,
      level: this.level,
    };
  }

  createGame(initialTetrimino?: Tetrimino): GameState {
    this.board = createBoard(BOARD_SIZE.rows, BOARD_SIZE.columns);
    const first =
      initialTetrimino ?? this.options.getNextPiece?.() ?? randomTetrimino();
    this.piece = {
      position: { ...INITIAL_PLAYER_POSITION },
      terimino: first,
      collided: false,
    };
    this.nextTetrimino = this.options.getNextPiece?.() ?? randomTetrimino();
    this.gameOver = false;
    this.lockCountdown = 0;
    this.score = 0;
    this.linesClearedTotal = 0;
    this.level = DEFAULT_LEVEL;
    return this.getState();
  }

  applyPenalty(count: number): void {
    if (count <= 0) return;
    this.board = addPenaltyLines(this.board, count);
  }

  applyAction(action: PlayerAction): GameState {
    switch (action) {
      case "left":
        return this.move("left");
      case "right":
        return this.move("right");
      case "down":
        return this.move("down");
      case "rotate":
        return this.rotate();
      case "hardDrop":
        return this.hardDrop();
      default:
        return this.getState();
    }
  }

  move(direction: MoveDirection): GameState {
    if (this.gameOver) return this.getState();
    const delta =
      direction === "left"
        ? { x: -1, y: 0 }
        : direction === "right"
          ? { x: 1, y: 0 }
          : { x: 0, y: 1 };
    if (!checkCollision(this.piece, this.board, delta)) {
      this.lockCountdown = LOCK_DELAY_TICKS;
      this.piece = {
        ...this.piece,
        position: {
          x: this.piece.position.x + delta.x,
          y: this.piece.position.y + delta.y,
        },
      };
    } else if (direction === "down") {
      this.tryLock();
    }
    return this.getState();
  }

  rotate(): GameState {
    if (this.gameOver) return this.getState();
    const shape = this.piece.terimino.shape;
    const firstRow = shape[0];
    if (!firstRow?.length) return this.getState();

    const rotatedShape: number[][] = firstRow.map((_, index) =>
      shape.map((row) => row[index] ?? 0),
    );

    rotatedShape.forEach((row) => row.reverse());

    const rotatedPlayer: PieceType = {
      ...this.piece,
      terimino: { ...this.piece.terimino, shape: rotatedShape },
    };

    const kicks = [0, 1, -1, 2, -2];
    for (const kick of kicks) {
      const kickedPlayer: PieceType = {
        ...rotatedPlayer,
        position: {
          ...rotatedPlayer.position,
          x: rotatedPlayer.position.x + kick,
        },
      };

      if (!checkCollision(kickedPlayer, this.board, { x: 0, y: 0 })) {
        this.lockCountdown = LOCK_DELAY_TICKS;
        this.piece = kickedPlayer;
        break;
      }
    }

    return this.getState();
  }

  hardDrop(): GameState {
    if (this.gameOver) return this.getState();
    let dy = 0;
    while (!checkCollision(this.piece, this.board, { x: 0, y: dy + 1 })) {
      dy++;
    }
    if (dy === 0 && this.piece.position.y < 1) {
      this.gameOver = true;
      return this.getState();
    }
    const locked: PieceType = {
      ...this.piece,
      position: {
        x: this.piece.position.x,
        y: this.piece.position.y + dy,
      },
      collided: true,
    };
    this.applyLock(locked);
    return this.getState();
  }

  tick(): GameState {
    if (this.gameOver) return this.getState();
    if (!checkCollision(this.piece, this.board, { x: 0, y: 1 })) {
      this.lockCountdown = LOCK_DELAY_TICKS;
      this.piece = {
        ...this.piece,
        position: {
          x: this.piece.position.x,
          y: this.piece.position.y + 1,
        },
      };
    } else {
      this.tryLock();
    }
    return this.getState();
  }

  private tryLock(): void {
    if (this.piece.position.y < 1) {
      this.gameOver = true;
      return;
    }
    if (this.lockCountdown > 0) {
      this.lockCountdown--;
      return;
    }
    this.applyLock(this.piece);
  }

  private applyLock(pieceToLock: PieceType): void {
    const newBoard = this.board.map((row) => [...row]);
    const { terimino, position } = pieceToLock;
    terimino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const by = y + position.y;
          const bx = x + position.x;
          if (newBoard[by]?.[bx] !== undefined) {
            newBoard[by][bx] = terimino.colorClass;
          }
        }
      });
    });
    const { board: afterClear, linesCleared } = clearLinesWithCount(newBoard);
    this.board = afterClear;
    if (linesCleared > 0) {
      this.score += scoreForLines(linesCleared, this.level);
      this.linesClearedTotal += linesCleared;
      const newLevel = levelForLines(this.linesClearedTotal);
      if (newLevel !== this.level) {
        this.level = newLevel;
        this.options.onDropTimeChange?.(getDropTime(this.level, this.options.modifier));
      }
      this.options.onLinesCleared?.(linesCleared);
    }
    this.piece = {
      position: { ...INITIAL_PLAYER_POSITION },
      terimino: this.nextTetrimino,
      collided: false,
    };
    this.nextTetrimino = this.options.getNextPiece?.() ?? randomTetrimino();
    this.lockCountdown = LOCK_DELAY_TICKS;
  }
}
