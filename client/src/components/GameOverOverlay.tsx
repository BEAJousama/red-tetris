import { getLevelIcon, getMotivationMessage } from "../utils/levelUtils";

const GameOverOverlay = ({
  onRetry,
  level = 1,
}: {
  onRetry: () => void;
  level?: number;
}) => {
  const {
    icon: IconName,
    color,
    glow,
    border,
    title,
  } = getLevelIcon(level);

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div className="pixel-panel mx-4 flex w-full max-w-sm flex-col items-center gap-6 p-8">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className={`absolute h-full w-full rounded-full border-2 ${border}`} />
          <IconName size={36} className={`${color} ${glow}`} />
        </div>

        <div className="text-center">
          <h2 className="game-title text-lg">
            <span className={color}>{title}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {getMotivationMessage(level)}
          </p>
        </div>

        <button
          aria-label="Restart solo game"
          onClick={onRetry}
          className="retro-button retro-button-accent retro-focus pixel-text flex w-full items-center justify-center gap-3 py-3 text-sm font-black"
        >
          <span className="relative z-10">Restart Game</span>
        </button>
      </div>
    </div>
  );
};

export default GameOverOverlay;
