import { AlertTriangle } from "lucide-react";
import type { Blocker } from "react-router";

const LeaveGameOverlay = ({ blocker }: { blocker: Blocker }) => {
  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div className="pixel-panel mx-4 flex w-full max-w-sm flex-col items-center gap-6 p-8">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-2 border-[color:color-mix(in_oklab,var(--accent)_40%,transparent)]" />
          <AlertTriangle size={36} className="text-[var(--accent)]" />
        </div>

        <div className="text-center">
          <h2 className="game-title text-lg">
            Leave <span className="text-[var(--accent)]">Game</span>?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Your progress will be lost.
          </p>
        </div>

        <div className="flex w-full gap-3">
          <button
            aria-label="Stay in game"
            onClick={() => blocker.reset?.()}
            className="retro-button retro-focus pixel-text flex flex-1 items-center justify-center gap-3 py-3 text-sm font-black"
          >
            <span>STAY</span>
          </button>
          <button
            aria-label="Leave game"
            onClick={() => blocker.proceed?.()}
            className="retro-button retro-button-accent retro-focus pixel-text flex flex-1 items-center justify-center gap-3 py-3 text-sm font-black"
          >
            <span>LEAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveGameOverlay;
