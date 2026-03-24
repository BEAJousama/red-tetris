import type { Server } from "socket.io";
import { persistScores } from "../db";
import { Game } from "./Game";
const MAX_PLAYERS = 10;

export class Room {
  hostSocketId: string | null = null;
  private game: Game | null = null;
  started = false;
  private lastModifier: string | undefined = undefined;
  private _modifier = "standard";
  private _players = new Map<string, string>();

  constructor(public readonly roomId: string) {}

  get players(): Map<string, string> {
    return this._players;
  }

  get modifier(): string {
    return this._modifier;
  }

  private getFirstSocketId(): string | undefined {
    return this._players.keys().next().value;
  }

  isEmpty(): boolean {
    return this._players.size === 0;
  }

  isHost(socketId: string): boolean {
    return this.hostSocketId === socketId;
  }

  canJoin(): boolean {
    if (this.started || this._players.size >= MAX_PLAYERS) {
      return false;
    }
    return true;
  }

  addPlayer(socketId: string, name: string, modifier?: string): boolean {
    // if (!this.canJoin()) return false;
    const trimmed = name.toLocaleLowerCase().trim();
    for (const existingName of this._players.values()) {
      if (existingName === trimmed) {
        return false;
      }
    }

    if (this.isEmpty()) this._modifier = modifier ?? "standard";
    this._players.set(socketId, name);
    if (this.hostSocketId === null) this.hostSocketId = socketId;
    return true;
  }

  removePlayer(socketId: string, skipHostReassignment = false): void {
    this._players.delete(socketId);
    if (this.hostSocketId === socketId && !skipHostReassignment) {
      this.hostSocketId = this.getFirstSocketId() ?? null;
    }
    if (this.game) {
      this.game.removePlayer(socketId);
      if (this._players.size < 2 && this.game) {
        this.game.stop();
        this.game = null;
      }
    }
  }

  startGame(io: Server, isRestart = false, modifier?: string): boolean {
    if (modifier !== undefined) this.lastModifier = modifier;
    const effectiveModifier = modifier ?? this.lastModifier;
    if (this.isEmpty() || this.hostSocketId === null) return false;
    if (!isRestart && this.started) return false;
    this.started = true;
    const roomId = this.roomId;
    const playerInfos = Array.from(this._players.entries()).map(
      ([socketId, name]) => ({ socketId, name }),
    );
    const game = new Game(
      roomId,
      playerInfos,
      {
        toPlayer: (sid, event, payload) => {
          io.to(sid).emit(event, payload);
        },
        toRoom: (event, payload) => io.to(roomId).emit(event, payload),
      },
      (winnerSocketId, results) => {
        this.started = false;
        this.game = null;
        if (winnerSocketId && this._players.has(winnerSocketId)) {
          this.hostSocketId = winnerSocketId;
        }
        if (winnerSocketId) {
          const winnerResult = results.find(
            (r) => r.socketId === winnerSocketId,
          );
          if (winnerResult) {
            persistScores([
              {
                playerName: winnerResult.playerName,
                score: winnerResult.score,
                linesCleared: winnerResult.linesCleared,
                level: winnerResult.level,
              },
            ]);
          }
        }
        io.to(roomId).emit("round_over", {
          winnerSocketId,
          winnerName: winnerSocketId
            ? (this._players.get(winnerSocketId) ?? null)
            : null,
          newHostSocketId: this.hostSocketId,
          results: results.map((r) => ({
            playerName: r.playerName,
            score: r.score,
            linesCleared: r.linesCleared,
            level: r.level,
          })),
        });
      },
      (result) => {
        persistScores([result]);
      },
      effectiveModifier,
    );
    this.game = game;
    game.start();
    return true;
  }

  restartGame(io: Server, requestedBySocketId: string, type?: string): boolean {
    if (!this.isHost(requestedBySocketId)) {
      io.to(requestedBySocketId).emit("restart_error", {
        reason: "Only host could restart the game!",
      });
      return false;
    }

    if (this.started) {
      io.to(requestedBySocketId).emit("restart_error", {
        reason: "Game already started!",
      });
      return false;
    }

    if (this._players.size <= 1 && type != "solo") {
      io.to(requestedBySocketId).emit("restart_error", {
        reason: "Wait for opponents to join!",
      });
      return false;
    }

    if (this.game) this.game.stop();
    this.game = null;
    return this.startGame(io, true);
  }

  getGame(): Game | null {
    return this.game;
  }
}
