import type { StatsType } from "../utils/types";

interface GameStatsProps {
  stats: StatsType;
  isGameOver?: boolean;
  fields?: Array<"score" | "lines" | "level">;
}

const GameStatsDisplay = ({ stats, isGameOver, fields }: GameStatsProps) => {
  const allItems = [
    {
      key: "score" as const,
      label: "SCORE",
      value: stats.score.toLocaleString(),
      color: "text-[var(--accent)]",
    },
    {
      key: "lines" as const,
      label: "LINES",
      value: stats.lines,
      color: "text-[var(--foreground)]",
    },
    {
      key: "level" as const,
      label: "LEVEL",
      value: stats.level,
      color: "text-[var(--accent)]",
    },
  ];
  const items = fields?.length
    ? allItems.filter((item) => fields.includes(item.key))
    : allItems;

  return (
    <div
      className={`flex w-full max-w-[320px] flex-col gap-3 transition-all duration-200 ${isGameOver ? "opacity-40" : "opacity-100"}`}
    >
      {items.map((item) => (
        <div key={item.label} className="hud-bracket-frame">
          <div className="hud-bracket-rail hud-bracket-rail--left" aria-hidden />
          <div className="hud-bracket-inner flex flex-col">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className={`pixel-text text-[11px] font-black ${item.color}`}
              >
                {item.label}
              </span>
              {item.label === "LEVEL" && <span className="hud-label">HUD</span>}
            </div>
            <span className="stat-value text-3xl leading-none text-[var(--foreground)] sm:text-4xl">
              {item.value}
            </span>
          </div>
          <div className="hud-bracket-rail hud-bracket-rail--right" aria-hidden />
        </div>
      ))}
    </div>
  );
};

export default GameStatsDisplay;
