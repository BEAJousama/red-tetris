import { DEFAULT_LEVEL } from "./scoring";
import { GameEngine } from "./GameEngine";
import { getStealthDisplayBoard, getGhostPlayer, getDropTime, tetriminoAt } from "./helpers";
import { Player } from "./Player";
import type { GameState, SpectrumUpdate } from "./types";

export interface PlayerInfo {
  socketId: string;
  name: string;
}

export interface GameEmit {
  toPlayer: (socketId: string, event: string, payload: unknown) => void;
  toRoom: (event: string, payload: unknown) => void;
}

export class Game {
  private pieceSequence!: number;
  private players = new Map<string, Player>();
  private gravityTimers = new Map<string, ReturnType<typeof setInterval>>();
  private eliminatedPersisted = new Set<string>();

  constructor(
    public readonly roomId: string,
    private readonly playerInfos: PlayerInfo[],
    private readonly emit: GameEmit,
    private readonly onRoundEnd: (
      winnerSocketId: string | null,
      results: Array<{
        socketId: string;
        playerName: string;
        score: number;
        linesCleared: number;
        level: number;
      }>,
    ) => void,
    private readonly onPlayerEliminated?: (result: {
      playerName: string;
      score: number;
      linesCleared: number;
      level: number;
    }) => void,
    private readonly modifier?: string,
  ) {}

  start(): void {
    const seed = Math.abs((this.roomId.length * 31 + Date.now()) | 0);
    this.pieceSequence = seed;
 
    for (const { socketId, name } of this.playerInfos) {
      let index =  1;
      const getNextPiece = () => tetriminoAt(this.pieceSequence ,index++);
      const engine = new GameEngine({
        getNextPiece,
        onLinesCleared: (n) => this.applyPenaltyToOthers(socketId, n),
        modifier: this.modifier ?? "",
        onDropTimeChange: (newDropTime) =>
          this.restartGravityFor(socketId, newDropTime),
      });
      engine.createGame(tetriminoAt(this.pieceSequence ,0));
      const player = new Player(socketId, name, engine);
      this.players.set(socketId, player);
      const initialDropTime = getDropTime(DEFAULT_LEVEL, this.modifier);
      this.startGravityFor(socketId, initialDropTime);
    }
    this.emitStateAndSpectra();
  }

  stop(): void {

    for (const timer of this.gravityTimers.values()) {
      clearInterval(timer);
    }
    this.gravityTimers.clear();
  }

  private startGravityFor(socketId: string, dropTime: number): void {
    const existing = this.gravityTimers.get(socketId);
    if (existing) clearInterval(existing);
    const timer = setInterval(() => this.tickPlayer(socketId), dropTime);
    this.gravityTimers.set(socketId, timer);
  }

  private restartGravityFor(socketId: string, dropTime: number): void {
    if (!this.players.has(socketId)) return;
    this.startGravityFor(socketId, dropTime);
  }

  private tickPlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (!player || player.isGameOver) return;
    player.engine.tick();
    this.emitStateAndSpectra();
    this.checkRoundEnd();
  }

  getStateFor(socketId: string): GameState | null {
    return this.players.get(socketId)?.getState() ?? null;
  }

  getRoundResults(): Array<{
    socketId: string;
    playerName: string;
    score: number;
    linesCleared: number;
    level: number;
  }> {
    return Array.from(this.players.entries()).map(([sid, p]) => {
      const state = p.getState();
      return {
        socketId: sid,
        playerName: p.name,
        score: state.score ?? 0,
        linesCleared: state.linesCleared ?? 0,
        level: state.level ?? 1,
      };
    });
  }


  getSpectra(): SpectrumUpdate[] {
    return Array.from(this.players.values()).map((p) => ({
      playerName: p.name,
      spectrum: p.getState().board,
    }));
  }

  applyMove(socketId: string, direction: "left" | "right" | "down"): void {
    const player = this.players.get(socketId);
    if (!player?.engine) return;
    player.engine.move(direction);
    this.afterPlayerAction();
  }

  removePlayer(socketId: string): void {
    const timer = this.gravityTimers.get(socketId);
    if (timer) clearInterval(timer);
    this.gravityTimers.delete(socketId);
    this.players.delete(socketId);
    this.checkRoundEnd();
  }
  
  applyRotate(socketId: string): void {
    const player = this.players.get(socketId);
    if (!player?.engine) return;
    player.engine.rotate();
    this.afterPlayerAction();
  }

  applyHardDrop(socketId: string): void {
    const player = this.players.get(socketId);
    if (!player?.engine) return;
    player.engine.hardDrop();
    this.afterPlayerAction();
  }

  private afterPlayerAction(): void {
    this.emitStateAndSpectra();
    this.checkRoundEnd();
  }

  private applyPenaltyToOthers(
    fromSocketId: string,
    linesCleared: number,
  ): void {
    const penalty = Math.max(0, linesCleared - 1);
    if (penalty === 0) return;
    for (const [sid, player] of this.players) {
      if (sid !== fromSocketId && !player.isGameOver) {
        player.applyPenalty(penalty);
      }
    }
  }

  private emitStateAndSpectra(): void {
    for (const [socketId, player] of this.players) {
      const state = player.getState();
      const board =
      this.modifier === "invisible"
      ? getStealthDisplayBoard(state.board, state.player)
      : state.board;
      const ghostPlayer =
        this.modifier === "invisible"
          ? null
          : getGhostPlayer(state.player, state.board);
      this.emit.toPlayer(socketId, "gameState", {
        ...state,
        board,
        modifier: this.modifier,
        socketId,
        ghostPlayer,
        playerName: player.name,
      });
    }
    this.emit.toRoom("spectrum_update", this.getSpectra());
  }

  private checkRoundEnd(): void {
    for (const [socketId, p] of this.players) {
      if (p.isGameOver && !this.eliminatedPersisted.has(socketId)) {
        this.eliminatedPersisted.add(socketId);
        const state = p.getState();
        this.onPlayerEliminated?.({
          playerName: p.name,
          score: state.score ?? 0,
          linesCleared: state.linesCleared ?? 0,
          level: state.level ?? 1,
        });
      }
    }
    const stillAlive = Array.from(this.players.entries()).filter(
      ([_, p]) => !p.isGameOver,
    );
    // End round when: everyone is dead, or (multiplayer) exactly one player left
    const everyoneDead = stillAlive.length === 0;
    const oneWinnerLeft = stillAlive.length === 1 && this.players.size > 1;
    if (everyoneDead || oneWinnerLeft) {
      this.stop();
      const results = Array.from(this.players.entries()).map(([sid, p]) => {
        const state = p.getState();
        return {
          socketId: sid,
          playerName: p.name,
          score: state.score ?? 0,
          linesCleared: state.linesCleared ?? 0,
          level: state.level ?? 1,
        };
      });
      this.onRoundEnd(stillAlive[0]?.[0] ?? null, results);
    }
  }
}
