import { EyeOff, ShieldAlert, Swords, User, Zap } from "lucide-react";
import type {
  LeaderboardEntry,
  ModifierType,
  Tetrimino,
  TetriminoType,
} from "./types";

export const BOARD_SIZE = {
  rows: 20,
  columns: 10,
} as const;

export const DROP_TIME = {
  INITIAL: 1000,
  FASTEST: 125,
} as const;

/** Socket/API base: env override, else same origin in prod build, else local API in dev. */
const envApi = import.meta.env.VITE_API_URL as string | undefined;
export const BASE_URL =
  envApi && envApi.length > 0
    ? envApi
    : import.meta.env.DEV
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

export const INITIAL_PLAYER_POSITION = {
  x: 4,
  y: -2,
} as const;

export const LINES_PER_LEVEL = 5 as const;

export const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

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

export const GAME_MODES = [
  { id: "solo", icon: User, label: "Solo", desc: "Training Sim" },
  {
    id: "battle",
    icon: Swords,
    label: "Battle",
    desc: "Live Combat",
  },
];

export const MODIFIERS: ModifierType[] = [
  { id: "standard", label: "Standard", desc: "Default Physics", icon: Zap },
  { id: "invisible", label: "Stealth", desc: "Invisible Pieces", icon: EyeOff },
  {
    id: "gravity_storm",
    label: "Storm",
    desc: "Increased gravity",
    icon: ShieldAlert,
  },
];

export const MOCK_ENTRIES: LeaderboardEntry[] = [
  {
    player_name: "GHOST_X",
    score: 48200,
    lines_cleared: 184,
    level: 19,
  },
  {
    player_name: "NULL_PTR",
    score: 36500,
    lines_cleared: 142,
    level: 15,
  },
  {
    player_name: "SEGFAULT",
    score: 29800,
    lines_cleared: 118,
    level: 12,
  },
  {
    player_name: "EXEC_42",
    score: 21300,
    lines_cleared: 97,
    level: 10,
  },
  {
    player_name: "DAEMON_7",
    score: 18750,
    lines_cleared: 83,
    level: 9,
  },
  {
    player_name: "KERNEL_P",
    score: 14200,
    lines_cleared: 69,
    level: 7,
  },
  {
    player_name: "VOID_RET",
    score: 11600,
    lines_cleared: 54,
    level: 6,
  },
  { player_name: "HEAP_42", score: 8900, lines_cleared: 41, level: 5 },
  {
    player_name: "STACK_0X",
    score: 6100,
    lines_cleared: 29,
    level: 3,
  },
  {
    player_name: "BYTE_ME",
    score: 3400,
    lines_cleared: 17,
    level: 2,
  },
  {
    player_name: "FORK_42",
    score: 2900,
    lines_cleared: 14,
    level: 2,
  },
  {
    player_name: "PIPE_DRM",
    score: 2400,
    lines_cleared: 11,
    level: 1,
  },
  {
    player_name: "SIGKILL",
    score: 2100,
    lines_cleared: 10,
    level: 1,
  },
  {
    player_name: "MALLOC_0",
    score: 1850,
    lines_cleared: 9,
    level: 1,
  },
  {
    player_name: "FREE_PTR",
    score: 1600,
    lines_cleared: 8,
    level: 1,
  },
  { player_name: "REALLOC", score: 1300, lines_cleared: 7, level: 1 },
  {
    player_name: "DEADBEEF",
    score: 1100,
    lines_cleared: 6,
    level: 1,
  },
  { player_name: "0XDEADC0", score: 900, lines_cleared: 5, level: 1 },
  { player_name: "COREDUMP", score: 700, lines_cleared: 4, level: 1 },
  { player_name: "INIT_0", score: 500, lines_cleared: 3, level: 1 },
  { player_name: "SIGSEV_X", score: 350, lines_cleared: 2, level: 1 },
  { player_name: "NULLPTR", score: 200, lines_cleared: 1, level: 1 },
  { player_name: "EXIT_13", score: 100, lines_cleared: 1, level: 1 },
  { player_name: "ZOMBIE_P", score: 50, lines_cleared: 0, level: 1 },
  { player_name: "ORPHAN_0", score: 10, lines_cleared: 0, level: 1 },
];
