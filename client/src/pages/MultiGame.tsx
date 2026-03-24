import { useEffect, useMemo } from "react";
import { useBlocker, useLocation, useNavigate, useParams } from "react-router";
import {
  Board,
  GameModeBadge,
  GameResultOverlay,
  GameStatsDisplay,
  NextPiecePanel,
  LeaveGameOverlay,
  SoundToggle,
  Spectrum,
  WaitingOverlay,
} from "../components";
import { useAppDispatch, useAppSelector, useGameSounds, useMultiplayer } from "../hooks";
import { socketMiddleware } from "../socket/socketMiddleware";
import { resetGame } from "../store/slices/gameSlice";
import { resetOpponent } from "../store/slices/opponentSlice";
import { resetPlayerStats } from "../store/slices/playerSlice";
import { unlockAudioFromUserGesture } from "../audio/gameAudio";
import { getRenderedBoard } from "../utils/gameHelpers";
import type { GameModifier } from "../utils/types";

export const MultiGame = () => {
  const { room_id: roomIdParam, playerName: playerNameParam } = useParams();
  const locationState = useLocation().state as {
    modifier: GameModifier;
  } | null;
  const modifier = locationState?.modifier ?? "standard";
  const navigate = useNavigate();
  const { board, player, ghostPlayer, gameOver, winner, nextPiece } = useAppSelector(
    (state) => state.game,
  );
  const {
    name: playerName,
    roomId,
    isHost,
    score,
    lines,
    level,
  } = useAppSelector((state) => state.player);
  const { opponnents } = useAppSelector((state) => state.opponent);
  const dispatch = useAppDispatch();
  const {
    canStartGame,
    playerCount,
    requestStartGame,
    requestRestartGame,
    restartError,
    startError,
  } = useMultiplayer(
    roomIdParam ?? "",
    playerNameParam ?? "",
    "battle",
    modifier,
  );

  useGameSounds(opponnents.length > 0 && board.length > 0);

  const renderedBoard = useMemo(
    () =>
      player
        ? getRenderedBoard({ board, player, ghostPlayer, modifier })
        : board,
    [board, player, ghostPlayer, modifier],
  );

  const blocker = useBlocker(({ nextLocation }) => {
    if (nextLocation.state?.isJoinError || !opponnents.length) return false;
    return !gameOver;
  });

  useEffect(() => {
    if (!roomIdParam || !playerNameParam) {
      navigate("/", { replace: true });
      return;
    }

    socketMiddleware.connect();

    return () => {
      socketMiddleware.disconnect();
      dispatch(resetGame());
      dispatch(resetOpponent());
      dispatch(resetPlayerStats());
    };
  }, [roomIdParam, playerNameParam, navigate, dispatch]);

  useEffect(() => {
    if (gameOver) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameOver]);

  return (
    <section className="relative z-1 flex min-h-screen flex-1 items-center justify-center px-3 py-6 font-sans sm:px-6">
      {opponnents.length > 0 && board.length > 0 && (
        <div
          className="flex w-full max-w-6xl flex-col gap-4"
          onPointerDown={() => unlockAudioFromUserGesture()}
        >
          <div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <aside className="order-2 flex w-full max-w-[200px] flex-col gap-3 justify-self-center lg:order-1 lg:ml-auto lg:justify-self-end lg:pr-3">
              <GameModeBadge modifier={modifier} />
              <SoundToggle />
              <NextPiecePanel piece={nextPiece} />
            </aside>

            <div className="order-1 flex justify-center lg:order-2">
              <Board
                board={renderedBoard}
                playerName={playerName}
                isLead={isHost}
              />
            </div>

            <aside className="order-3 flex flex-col gap-3 lg:items-start lg:pl-3">
              <GameStatsDisplay stats={{ score, lines, level }} fields={["level"]} />
              <GameStatsDisplay stats={{ score, lines, level }} fields={["score", "lines"]} />

              <div className="pixel-panel p-3">
                <h3 className="pixel-text mb-2 text-xs font-bold text-[var(--muted)]">
                  Opponent Spectra
                </h3>
                {/* Scroll inside spectra panel; keep the page layout unchanged */}
                <div className="max-h-[260px] min-h-0 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
                  <div className="grid grid-cols-1 gap-y-4 justify-items-center sm:grid-cols-2 sm:gap-x-3 sm:gap-y-4">
                    {opponnents.map((opponent) => (
                      <Spectrum
                        key={opponent.id}
                        boardData={opponent.board}
                        playerName={opponent.name}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {board.length === 0 && !gameOver && (
        <WaitingOverlay
          roomId={roomId}
          playerCount={playerCount}
          canStartGame={canStartGame}
          onStart={requestStartGame}
          modifier={modifier}
          startError={startError}
        />
      )}

      {gameOver && (
        <GameResultOverlay
          winner={winner ?? false}
          canRestartGame={canStartGame}
          onRestart={requestRestartGame}
          restartError={restartError}
          onLeave={() => navigate("/", { replace: true, state: null })}
        />
      )}

      {blocker.state === "blocked" && <LeaveGameOverlay blocker={blocker} />}
    </section>
  );
};

export default MultiGame;
