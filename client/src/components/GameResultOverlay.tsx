import { Shield, Skull } from "lucide-react";

const ActionButton = ({
  winner,
  disabled = false,
  label,
  onClick,
}: {
  winner: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`retro-button retro-focus pixel-text flex w-full items-center justify-center gap-3 py-3 text-sm font-black ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : winner
            ? "retro-button-accent"
            : "border-[var(--foreground)] bg-[var(--card)]"
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
};

const GameResultOverlay = ({
  winner,
  canRestartGame,
  restartError,
  onRestart,
  onLeave,
}: {
  winner: boolean;
  canRestartGame: boolean;
  restartError: string | null;
  onRestart: () => void;
  onLeave: () => void;
}) => {
  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div className="pixel-panel mx-4 flex w-full max-w-sm flex-col items-center gap-5 p-8">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div
            className={`absolute h-full w-full rounded-full border-2 ${
              winner
                ? "border-[color:color-mix(in_oklab,var(--accent)_40%,transparent)]"
                : "border-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)]"
            }`}
          />
          {winner ? (
            <Shield
              size={36}
              className="text-[var(--accent)]"
            />
          ) : (
            <Skull
              size={36}
              className="text-[var(--foreground)]"
            />
          )}
        </div>

        <div className="text-center">
          <h2 className="game-title text-lg">
            {winner ? (
              <>
                Mission <span className="text-[var(--accent)]">Complete</span>
              </>
            ) : (
              <>
                Mission <span className="text-[var(--foreground)]">Failed</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {winner
              ? "Enemy eliminated. You are victorious."
              : "Your defenses have been overwhelmed."}
          </p>
        </div>

        <ActionButton
          winner={winner}
          label="RESTART GAME"
          onClick={onRestart}
          disabled={!canRestartGame}
        />
        <ActionButton winner={winner} label="LEAVE" onClick={onLeave} />
        {!canRestartGame ? (
          <span className="mt-2 text-xs text-[var(--muted)]">
            Only the new host can restart the game.
          </span>
        ) : (
          restartError && (
            <span className="mt-2 text-xs text-red-500">{restartError}</span>
          )
        )}
      </div>
    </div>
  );
};

export default GameResultOverlay;
