import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "data", "scores.sqlite");
const DATA_DIR = path.dirname(DB_PATH);

interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): {
    run: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown[];
  };
  transaction<T>(fn: (arg: T) => void): (arg: T) => void;
}
let db: SqliteDb | null = null;

function deriveLevel(linesCleared: number): number {
  return Math.max(1, Math.floor(linesCleared / 5) + 1);
}

function getDb(): SqliteDb | null {
  if (db !== undefined && db !== null) return db;
  try {
    const Database = require("better-sqlite3") as new (p: string) => SqliteDb;
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        lines_cleared INTEGER NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    try {
      db.exec("ALTER TABLE scores ADD COLUMN level INTEGER NOT NULL DEFAULT 1");
    } catch {
      console.log("Column already exists on existing DBs.");
    }
    return db;
  } catch (e) {
    console.warn("SQLite unavailable, scores will not persist:", (e as Error).message);
    db = null;
    return null;
  }
}

export interface ScoreEntry {
  player_name: string;
  score: number;
  lines_cleared: number;
  level: number;
  created_at?: string;
}

export function persistScores(
  results: Array<{
    playerName: string;
    score: number;
    linesCleared: number;
    level?: number;
  }>,
): void {
  const database = getDb();
  if (database == null) return;
  const stmt = database.prepare(
    "INSERT INTO scores (player_name, score, lines_cleared, level) VALUES (?, ?, ?, ?)",
  );
  const insertMany = database.transaction(
    (rows: Array<{ playerName: string; score: number; linesCleared: number; level?: number }>) => {
      for (const row of rows) {
        stmt.run(
          row.playerName,
          row.score,
          row.linesCleared,
          row.level ?? deriveLevel(row.linesCleared),
        );
      }
    },
  );
  try {
    insertMany(results);
  } catch (e) {
    console.warn("Failed to persist scores:", (e as Error).message);
  }
}

export function getLeaderboard(): ScoreEntry[] {
  const database = getDb();
  if (database == null) return [];
  try {
    const rows = database
      .prepare(
        "SELECT player_name, score, lines_cleared, level, created_at FROM scores ORDER BY score DESC, created_at ASC",
      )
      .all() as ScoreEntry[];
    return rows;
  } catch (e) {
    console.warn("Failed to read leaderboard:", (e as Error).message);
    return [];
  }
}
