import { Crown, Medal, Trophy } from "lucide-react";
import { Fragment, Suspense, use, useState } from "react";
import { useNavigate } from "react-router";
import { BASE_URL } from "../utils/constants";
import type { LeaderboardEntry } from "../utils/types";

const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/leaderboard`);
    const data: { leaderboard: LeaderboardEntry[] } = await response.json();

    return data.leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

const RankIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return (
        <Crown
          size={16}
          className="text-[var(--accent)] drop-shadow-[0_0_6px_var(--accent)]"
        />
      );
    case 2:
      return (
        <Medal
          size={16}
          className="text-[color:color-mix(in_oklab,var(--foreground)_75%,transparent)]"
        />
      );
    case 3:
      return (
        <Trophy
          size={16}
          className="text-[color:color-mix(in_oklab,var(--accent)_70%,#b87333)]"
        />
      );
    default:
      return (
        <span className="w-4 text-center text-xs font-black text-[var(--muted)]">
          {rank}
        </span>
      );
  }
};

const LoadingFallback = () => (
  <div className="col-span-5 flex flex-col items-center justify-center gap-4 py-16">
    <div className="size-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
    <p className="pixel-text text-sm font-black text-[var(--muted)]">
      Loading scores...
    </p>
  </div>
);

const LeaderboardRows = ({
  promise,
}: {
  promise: Promise<LeaderboardEntry[]>;
}) => {
  const entries = use(promise);

  if (entries.length === 0) {
    return (
      <div className="col-span-5 flex flex-col items-center justify-center gap-4 py-16">
        <Trophy size={40} className="text-[var(--muted)]" />
        <p className="pixel-text text-sm font-black text-[var(--muted)]">
          No data available
        </p>
        <p className="text-xs text-[var(--muted)]">
          Play a game to claim your spot!
        </p>
      </div>
    );
  }

  return entries.map((entry: LeaderboardEntry, index: number) => {
    const accent =
      index === 0
        ? "bg-[color:color-mix(in_oklab,var(--accent)_12%,transparent)]"
        : index === 1
          ? "bg-[color:color-mix(in_oklab,var(--foreground)_8%,transparent)]"
          : index === 2
            ? "bg-[color:color-mix(in_oklab,var(--accent)_8%,transparent)]"
            : "";
    const border =
      "border-b border-[color:color-mix(in_oklab,var(--foreground)_15%,transparent)] last:border-b-0";

    return (
      <Fragment key={index}>
        <div
          className={`${accent} ${border} flex items-center justify-center py-4`}
        >
          <RankIcon rank={index + 1} />
        </div>
        <div
          className={`${accent} ${border} flex items-center justify-center truncate py-4 text-base font-black tracking-wide text-[var(--foreground)]`}
        >
          {entry.player_name}
        </div>
        <div
          className={`${accent} ${border} flex items-center justify-center py-4 text-base font-bold text-[var(--accent)] tabular-nums`}
        >
          {entry.score.toLocaleString()}
        </div>
        <div
          className={`${accent} ${border} flex items-center justify-center py-4 text-base font-bold text-[var(--muted)] tabular-nums`}
        >
          {entry.lines_cleared}
        </div>
        <div
          className={`${accent} ${border} flex items-center justify-center py-4 text-base font-bold text-[var(--muted)] tabular-nums`}
        >
          {entry.level ?? 0}
        </div>
      </Fragment>
    );
  });
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardPromise] = useState<Promise<LeaderboardEntry[]>>(() =>
    fetchLeaderboard(),
  );

  return (
    <section className="relative z-1 flex min-h-screen flex-1 items-center justify-center px-3 py-8 font-sans">
      <div className="pixel-panel relative z-10 flex w-full max-w-5xl flex-col gap-5 p-6 sm:p-8">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="game-title text-4xl sm:text-5xl md:text-6xl">
          RED TETRIS
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Global command board. Highest score wins, clean and simple.
          </p>
        </header>

        <div className="pixel-card w-full overflow-hidden">
          <div className="grid grid-cols-[2.5rem_1fr_7rem_6rem_4rem] border-b border-[color:color-mix(in_oklab,var(--foreground)_20%,transparent)] bg-[color:color-mix(in_oklab,var(--card)_90%,black)] sm:grid-cols-[2.5rem_1fr_8rem_8rem_6rem]">
            {["#", "PLAYER", "SCORE", "LINES", "LVL"].map((h) => (
              <div
                key={h}
                className="pixel-text flex items-center justify-center py-3 text-[10px] font-black text-[var(--muted)]"
              >
                {h}
              </div>
            ))}
          </div>

          <div className="max-h-[70vh] overflow-y-auto bg-[color:color-mix(in_oklab,var(--card)_88%,black)] [scrollbar-color:color-mix(in_oklab,var(--foreground)_30%,transparent)_transparent] [scrollbar-width:thin]">
            <div className="grid grid-cols-[2.5rem_1fr_7rem_6rem_4rem] sm:grid-cols-[2.5rem_1fr_8rem_8rem_6rem]">
              <Suspense fallback={<LoadingFallback />}>
                <LeaderboardRows promise={leaderboardPromise} />
              </Suspense>
            </div>
          </div>
        </div>

        <button
          aria-label="Back to home"
          onClick={() => navigate("/")}
          className="retro-button retro-focus pixel-text mt-1 w-full py-3 text-sm font-black"
        >
          <span className="relative z-10">Back</span>
        </button>
      </div>
    </section>
  );
};

export default Leaderboard;
