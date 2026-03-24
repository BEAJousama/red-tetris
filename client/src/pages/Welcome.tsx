import { AlertTriangle, Globe, User, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setPlayerName, setRoomId } from "../store/slices/playerSlice";
import { GAME_MODES, MODIFIERS } from "../utils/constants";
import type { GameMode, GameModifier } from "../utils/types";

interface ErrorMessagePopupProps {
  title?: string;
  actionLabel?: string;
  errorMessage: string;
  onDismiss: () => void;
}

const ErrorMessagePopup = ({
  title = "Missing Info",
  actionLabel = "DISMISS",
  errorMessage,
  onDismiss,
}: ErrorMessagePopupProps) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div className="pixel-panel mx-4 flex w-full max-w-sm flex-col items-center gap-6 p-8">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-2 border-[color:color-mix(in_oklab,var(--accent)_40%,transparent)]" />
          <AlertTriangle size={36} className="text-[var(--accent)]" />
        </div>

        <div className="text-center">
          <h2 className="game-title text-lg">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {errorMessage}
          </p>
        </div>

        <button
          aria-label={actionLabel}
          onClick={onDismiss}
          className="retro-button retro-button-accent retro-focus pixel-text flex w-full items-center justify-center gap-3 py-3 text-sm font-black"
        >
          <X size={16} />
          <span>{actionLabel}</span>
        </button>
      </div>
    </div>
  );
};

const Welcome = () => {
  const [gameState, setGameState] = useState<{
    gameMode: GameMode;
    gameModifier: GameModifier;
  }>({
    gameMode: "solo",
    gameModifier: "standard",
  });
  const [soloName, setSoloName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { name, roomId } = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const locationState = useLocation().state as {
    error: string;
  } | null;
  const joinErrorMessage = locationState?.error ?? null;

  // useEffect(() => {
  //   setJoinErrorMessage(locationState?.error ?? null);
  // }, [locationState]);

  const popupMessage = errorMessage ?? joinErrorMessage;
  const isJoinError = !errorMessage && Boolean(joinErrorMessage);

  const handleStart = () => {
    if (gameState.gameMode === "battle" && (!roomId || !name)) {
      setErrorMessage("Please enter a Player Name and Room ID");
      return;
    } else if (gameState.gameMode === "solo" && !soloName) {
      setErrorMessage("Please enter a Player Name");
      return;
    }

    const path =
      gameState.gameMode === "solo"
        ? `/solo/${soloName}`
        : `/${roomId}/${name}`;

    navigate(path, { state: { modifier: gameState.gameModifier } });
  };

  return (
    <section className="relative z-1 flex min-h-screen flex-1 items-center justify-center px-3 py-8 font-sans">
      <div className="pixel-panel relative z-10 flex w-full max-w-3xl flex-col gap-6 p-6 sm:p-8">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="game-title text-4xl sm:text-5xl md:text-6xl">
          RED TETRIS
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Stack fast. Clear lines. Survive the drop.
          </p>
        </header>

        {/* Game Mode Toggle (Solo vs Battle) */}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {GAME_MODES.map((m) => (
            <button
              aria-label={`Select ${m.label} mode`}
              key={m.id}
              className={`retro-focus pixel-card group flex cursor-pointer flex-col items-center p-4 transition-all duration-200 ${
                gameState.gameMode === m.id
                  ? "border-[var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_10%,var(--card))]"
                  : "hover:border-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)]"
              }`}
              onClick={() =>
                setGameState((prev) => ({
                  ...prev,
                  gameMode: m.id as GameMode,
                }))
              }
            >
              <m.icon
                size={32}
                className={`mb-2 ${gameState.gameMode === m.id ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
              />
              <h3 className="pixel-text text-sm font-black text-[var(--foreground)]">
                {m.label}
              </h3>
              <p className="text-[11px] text-[var(--muted)]">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="grid w-full gap-3">
          <div className="relative">
            <User
              size={16}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={gameState.gameMode === "solo" ? soloName : name}
              onChange={(e) =>
                gameState.gameMode === "solo"
                  ? setSoloName(e.target.value.trim().toLowerCase())
                  : dispatch(setPlayerName(e.target.value.trim().toLowerCase()))
              }
              placeholder="PLAYER NAME"
              className="retro-focus pixel-card w-full py-3 pr-4 pl-12 text-sm font-semibold tracking-wide text-[var(--foreground)] placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {gameState.gameMode === "battle" && (
            <div className="relative">
              <Globe
                size={16}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                type="text"
                value={roomId}
                onChange={(e) =>
                  dispatch(setRoomId(e.target.value.trim().toLowerCase()))
                }
                placeholder="ROOM ID"
                className="retro-focus pixel-card w-full py-3 pr-4 pl-12 text-sm font-semibold tracking-wide text-[var(--foreground)] placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          )}

          {/* Game Modifiers */}
          <div className="mt-1">
            <p className="pixel-text mb-2 text-[10px] font-black text-[var(--muted)]">
              Game Modifiers
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {MODIFIERS.map((mod) => (
                <button
                  aria-label={`Set modifier ${mod.label}`}
                  key={mod.id}
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, gameModifier: mod.id }))
                  }
                  className={`retro-focus pixel-card flex flex-col items-center justify-center p-3 transition-all duration-200 ${
                    gameState.gameModifier === mod.id
                      ? "border-[var(--accent)] bg-[color:color-mix(in_oklab,var(--accent)_12%,var(--card))] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:border-[color:color-mix(in_oklab,var(--foreground)_70%,transparent)]"
                  }`}
                >
                  <mod.icon size={18} className="mb-1" />
                  <span className="pixel-text text-[10px] font-black">
                    {mod.label}
                  </span>
                  <span className="text-[10px] font-bold opacity-70">
                    {mod.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              aria-label="Start game"
              onClick={handleStart}
              className="retro-button retro-button-accent retro-focus pixel-text py-3 text-sm font-black"
            >
              Play
            </button>

            <button
              aria-label="Open leaderboard"
              onClick={() => navigate("/leaderboard")}
              className="retro-button retro-focus pixel-text py-3 text-sm font-black"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {popupMessage && (
        <ErrorMessagePopup
          title={isJoinError ? "Join Error" : "Missing Info"}
          actionLabel={isJoinError ? "OK" : "DISMISS"}
          errorMessage={popupMessage}
          onDismiss={() => {
            setErrorMessage(null);
            navigate(".", { replace: true, state: null });
          }}
        />
      )}
    </section>
  );
};

export default Welcome;
