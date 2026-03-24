import type { Tetrimino } from "../utils/types";

interface NextPiecePanelProps {
  piece: Tetrimino | null;
}

/** Crop to filled cells only. */
function tightPieceGrid(
  shape: number[][],
): { rows: number[][]; w: number; h: number } | null {
  let minY = Infinity;
  let maxY = -1;
  let minX = Infinity;
  let maxX = -1;
  shape.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v !== 0) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    });
  });
  if (maxY < 0) return null;
  const h = maxY - minY + 1;
  const w = maxX - minX + 1;
  const rows = shape.slice(minY, maxY + 1).map((row) => row.slice(minX, maxX + 1));
  return { rows, w, h };
}

/**
 * Fixed cell size sized for 4 cells + gap-px across the preview width (~7.75rem).
 * Inner piece grid is flex-centered — no floor() bias; I (4×1) and O (2×2) align the same.
 */
const NEXT_CELL = "1.35rem";

function MiniPieceGrid({
  rows,
  w,
  h,
  colorClass,
}: {
  rows: number[][];
  w: number;
  h: number;
  colorClass: string;
}) {
  return (
    <div
      className="grid w-fit gap-px"
      style={{
        gridTemplateColumns: `repeat(${w}, ${NEXT_CELL})`,
        gridTemplateRows: `repeat(${h}, ${NEXT_CELL})`,
      }}
    >
      {rows.flatMap((row, y) =>
        row.map((value, x) => (
          <div
            key={`${y}-${x}`}
            className={
              value !== 0 ? colorClass : "min-h-0 min-w-0 bg-black/25"
            }
            style={
              value !== 0
                ? { boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)" }
                : undefined
            }
          />
        )),
      )}
    </div>
  );
}

const NextPiecePanel = ({ piece }: NextPiecePanelProps) => {
  const tight = piece?.shape ? tightPieceGrid(piece.shape) : null;

  return (
    <div className="hud-bracket-frame w-full min-w-0">
      <div className="hud-bracket-rail hud-bracket-rail--left" aria-hidden />
      <div className="hud-bracket-inner w-full min-w-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="pixel-text text-xs font-bold text-[var(--muted)]">
            Next Piece
          </h3>
          <span className="hud-label">NEXT</span>
        </div>
        <div className="hud-bracket-preview mx-auto flex aspect-square w-[min(100%,7.75rem)] items-center justify-center rounded-sm p-1 sm:w-[7.75rem]">
          {tight && piece ? (
            <MiniPieceGrid
              rows={tight.rows}
              w={tight.w}
              h={tight.h}
              colorClass={piece.colorClass}
            />
          ) : (
            <div
              className="grid w-fit gap-px opacity-40"
              style={{
                gridTemplateColumns: `repeat(4, ${NEXT_CELL})`,
                gridTemplateRows: `repeat(4, ${NEXT_CELL})`,
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="bg-black/30" />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="hud-bracket-rail hud-bracket-rail--right" aria-hidden />
    </div>
  );
};

export default NextPiecePanel;
