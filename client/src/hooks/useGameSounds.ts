import { useEffect, useRef } from "react";
import {
  playGameOver,
  playLevelUp,
  playLineClear,
  playNextPiece,
  playWin,
} from "../audio/gameAudio";
import { useAppSelector } from "./useAppSelector";

/**
 * Plays SFX when game stats / phase change (driven by server state).
 * Call with `enabled` true only while a match is active on the page.
 */
export function useGameSounds(enabled: boolean) {
  const lines = useAppSelector((s) => s.player.lines);
  const level = useAppSelector((s) => s.player.level);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const winner = useAppSelector((s) => s.game.winner);
  const nextPiece = useAppSelector((s) => s.game.nextPiece);

  const prev = useRef({
    lines: 0,
    level: 1,
    gameOver: false,
    winner: null as boolean | null,
    nextKey: "",
    hadAnyState: false,
  });

  useEffect(() => {
    if (!enabled) return;

    const p = prev.current;
    const nextKey = nextPiece
      ? `${nextPiece.colorClass}:${JSON.stringify(nextPiece.shape)}`
      : "";

    if (!p.hadAnyState) {
      p.hadAnyState = true;
      p.lines = lines;
      p.level = level;
      p.gameOver = gameOver;
      p.winner = winner;
      p.nextKey = nextKey;
      return;
    }

    const lineDelta = lines - p.lines;
    if (lineDelta > 0) {
      playLineClear(Math.min(lineDelta, 4));
    }

    if (level > p.level) {
      playLevelUp();
    }

    if (gameOver && !p.gameOver) {
      if (winner === true) playWin();
      else playGameOver();
    }

    if (nextKey && nextKey !== p.nextKey && p.nextKey !== "") {
      playNextPiece();
    }

    p.lines = lines;
    p.level = level;
    p.gameOver = gameOver;
    p.winner = winner;
    p.nextKey = nextKey;
  }, [enabled, lines, level, gameOver, winner, nextPiece]);
}
