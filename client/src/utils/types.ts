import type { LucideIcon } from "lucide-react";
import type { Socket } from "socket.io-client";

export type GameMode = "solo" | "battle";

export type TetriminoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export type GameModifier = "standard" | "invisible" | "gravity_storm";

type BoardCell = number | string;

export type BoardType = BoardCell[][];
export interface Tetrimino {
  shape: number[][];
  colorClass: string;
}

export interface PlayerType {
  position: { x: number; y: number };
  terimino: Tetrimino;
  collided: boolean;
}
export interface PlayerStats {
  score: number;
  lines: number;
  level: number;
}

export interface GameState {
  board: BoardType;
  player: PlayerType;
  nextPiece?: Tetrimino;
  opponentBoard?: BoardType;
  playerName?: string;
  opponentName?: string;
}

export interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
}

export interface ModifierType {
  id: GameModifier;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

export interface StatsType {
  score: number;
  lines: number;
  level: number;
}

export interface LeaderboardEntry {
  player_name: string;
  score: number;
  lines_cleared: number;
  level: number;
}

export interface LevelIconResult {
  icon: LucideIcon;
  color: string;
  btnColor: string;
  glow: string;
  border: string;
  title: string;
}
