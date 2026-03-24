import type { BoardType } from "../utils/types";

interface SpectrumProps {
  boardData: BoardType;
  playerName: string;
  isGameOver?: boolean;
  /** Narrower mini-board for side panels (10×20 aspect kept). */
  compact?: boolean;
}

const Spectrum = ({
  boardData,
  playerName,
  isGameOver = false,
  compact = false,
}: SpectrumProps) => {
  if (!boardData || !boardData.length) return null;

  const boardClass = compact
    ? "w-[4.5rem] sm:w-20"
    : "w-24";

  return (
    <div
      className={`group flex flex-col items-center gap-1.5 transition-opacity duration-200 ${isGameOver ? "opacity-50" : "opacity-100"}`}
    >
      <div
        className={`pixel-card relative grid aspect-[10/20] grid-cols-10 grid-rows-20 gap-px p-0.5 ${boardClass}`}
      >
        {boardData.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`h-full w-full transition-colors duration-200 ${
                cell === 0
                  ? "bg-black/30"
                  : `${cell} rounded-[0.5px] border-[0.2px] border-white/20 opacity-70`
              }`}
            />
          )),
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="pixel-text text-[10px] font-black text-[var(--accent)]">
              Out
            </span>
          </div>
        )}
      </div>

      <span className="pixel-text text-[10px] font-black text-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)] transition-colors group-hover:text-[var(--accent)]">
        {playerName}
      </span>
    </div>
  );
};

export default Spectrum;
