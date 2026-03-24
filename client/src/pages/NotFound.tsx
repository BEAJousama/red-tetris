import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="relative z-1 flex min-h-screen flex-1 items-center justify-center px-3 py-8 font-sans">
      <div className="pixel-panel mx-4 flex w-full max-w-xl flex-col items-center gap-5 p-8 text-center">
        <h1 className="game-title text-7xl sm:text-8xl md:text-9xl">404</h1>
        <p className="game-title text-lg sm:text-xl">
          Page <span className="text-[var(--accent)]">Not Found</span>
        </p>
        <p className="text-sm text-[var(--muted)]">
          The route you requested is unavailable. Return to base to continue.
        </p>

        <button
          aria-label="Return to home"
          onClick={() => navigate("/", { replace: true })}
          className="retro-button retro-button-accent retro-focus pixel-text mt-2 w-full max-w-xs py-3 text-sm font-black"
        >
          Return To Base
        </button>
      </div>
    </section>
  );
};

export default NotFound;
