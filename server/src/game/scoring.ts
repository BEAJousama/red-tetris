
const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const DEFAULT_LEVEL = 1;

export const LINES_PER_LEVEL = 5;

export function levelForLines(linesClearedTotal: number): number {
  return Math.max(DEFAULT_LEVEL, Math.floor(linesClearedTotal / LINES_PER_LEVEL) + 1);
}

export function scoreForLines(linesCleared: number, level = DEFAULT_LEVEL): number {
  if (linesCleared <= 0) return 0;
  const base = LINE_SCORES[linesCleared] ?? linesCleared * 100;
  return base * level;
}
