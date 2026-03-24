import { ShieldCheck } from "lucide-react";
import type { BoardType } from "../utils/types";
import Cell from "./Cell";

interface BoardProps {
  board: BoardType;
  playerName: string;
  isLead?: boolean;
}

const Board = ({ board, playerName, isLead }: BoardProps) => {
  return (
    <section
      aria-label={`${playerName} game board`}
      className="flex flex-col items-center justify-center select-none"
    >
      <div className="mb-2 flex w-full items-end justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="game-title max-w-32 truncate text-base sm:text-lg">
            {playerName}
          </h2>
          {isLead && (
            <div className="pixel-card flex items-center gap-1 px-2 py-0.5">
              <ShieldCheck
                size={12}
                className="text-[var(--accent)]"
              />
              <span className="pixel-text text-[9px] font-bold text-[var(--accent)]">
                Host
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-2 opacity-25 blur-xl [background:radial-gradient(circle,var(--accent),transparent_65%)]" />
        <div className="pixel-panel relative grid w-[88vw] max-w-[410px] grid-cols-10 grid-rows-20 gap-px p-1.5">
          {board.map((row, y) =>
            row.map((cellValue, x) => {
              const cellColor =
                typeof cellValue === "string" ? cellValue : "bg-black/40";

              return <Cell key={`${y}-${x}`} colorClass={cellColor} />;
            }),
          )}
        </div>
      </div>
    </section>
  );
};

export default Board;
