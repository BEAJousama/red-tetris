import { MODIFIERS } from "../utils/constants";
import type { GameModifier } from "../utils/types";

const GameModeBadge = ({
  modifier,
  className = "",
}: {
  modifier: GameModifier;
  className?: string;
}) => {
  const activeModifier =
    MODIFIERS.find((m) => m.id === modifier) ?? MODIFIERS[0];

  return (
    <div
      className={`pixel-card flex w-full min-w-0 items-center justify-center gap-2 px-3 py-1.5 ${className}`}
    >
      <activeModifier.icon size={14} className="text-[var(--accent)]" />
      <span className="pixel-text text-[10px] font-black text-[var(--muted)]">
        {activeModifier.id}
      </span>
    </div>
  );
};

export default GameModeBadge;
