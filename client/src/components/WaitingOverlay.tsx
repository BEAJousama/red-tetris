import { Play } from "lucide-react";

interface WaitingOverlayProps {
  roomId: string;
  playerCount: number;
  canStartGame: boolean;
  onStart?: () => void;
  modifier: string;
  startError?: string | null;
}

const WaitingOverlay = ({
  roomId,
  playerCount,
  canStartGame,
  onStart,
  modifier,
  startError,
}: WaitingOverlayProps) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div className="pixel-panel mx-4 flex w-full max-w-sm flex-col items-center gap-6 p-8">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
          <div className="absolute h-[80%] w-[80%] animate-[spin_3s_linear_infinite] rounded-full border border-dashed border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]" />
          <div className="h-4 w-4 animate-pulse bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]" />
        </div>

        <div className="text-center">
          <h2 className="game-title text-lg sm:text-xl">
            Waiting for <span className="text-[var(--accent)]">Players</span>
          </h2>
          <p className="pixel-text mt-4 text-xs text-[var(--muted)]">
            Room: <span className="text-[var(--foreground)] lowercase">{roomId}</span>
          </p>
          <p className="pixel-text mt-1 text-xs text-[var(--muted)]">
            Players:{" "}
            <span className="text-[var(--foreground)] lowercase">{playerCount}</span>
          </p>

          <p className="pixel-text mt-1 text-xs text-[var(--muted)]">
            Modifier:{" "}
            <span className="text-[var(--foreground)] lowercase">{modifier}</span>
          </p>
        </div>

        <div className="w-full pt-2">
          {canStartGame ? (
            <div className="flex flex-col items-center gap-3">
              {startError ? (
                <p className="text-xs text-red-500">{startError}</p>
              ) : (
                <button
                  aria-label="Start multiplayer game"
                  onClick={onStart}
                  className="retro-button retro-button-accent retro-focus pixel-text flex w-full items-center justify-center gap-3 py-3 text-sm font-black"
                >
                  <Play size={16} fill="white" />
                  <span>START GAME</span>
                </button>
              )}
            </div>
          ) : playerCount > 1 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex w-full items-center gap-2">
                <div className="h-px flex-1 bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]" />
                <span className="pixel-text text-[10px] font-bold text-[var(--muted)]">
                  Waiting for host to start
                </span>
                <div className="h-px flex-1 bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]" />
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center gap-2">
              <div className="h-px flex-1 bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]" />
              <span className="pixel-text text-[10px] font-bold text-[var(--muted)]">
                Waiting for more players to join
              </span>
              <div className="h-px flex-1 bg-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingOverlay;
