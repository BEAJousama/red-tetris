import { LogOut } from "lucide-react";

const ExitGameButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="retro-button retro-focus pixel-text flex w-full items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold"
      aria-label="Exit game"
    >
      <LogOut size={16} className="shrink-0 text-[var(--accent)]" />
      <span className="text-[var(--foreground)]">Exit game</span>
    </button>
  );
};

export default ExitGameButton;