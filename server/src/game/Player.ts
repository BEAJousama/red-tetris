import { GameEngine } from "./GameEngine";
import type { GameState, Spectrum, Tetrimino } from "./types";


export class Player {
  constructor(
    public readonly socketId: string,
    public readonly name: string,
    public readonly engine: GameEngine,
  ) {}

  getState(): GameState {
    return this.engine.getState();
  }

  get isGameOver(): boolean {
    return this.engine.getState().gameOver;
  }

  applyPenalty(lines: number): void {
    this.engine.applyPenalty(lines);
  }
}
