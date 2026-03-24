import { useEffect, useMemo, useState } from "react";
import { useBlocker, useLocation, useNavigate, useParams } from "react-router";
import {
  Board,
  GameModeBadge,
  GameOverOverlay,
  GameStatsDisplay,
  NextPiecePanel,
  LeaveGameOverlay,
  SoundToggle,
} from "../components";
import { useAppDispatch, useAppSelector, useGameSounds, useMultiplayer } from "../hooks";
import { socketMiddleware } from "../socket/socketMiddleware";
import { resetGame } from "../store/slices/gameSlice";
import { resetPlayerStats } from "../store/slices/playerSlice";
import { unlockAudioFromUserGesture } from "../audio/gameAudio";
import { getRenderedBoard } from "../utils/gameHelpers";
import type { GameModifier } from "../utils/types";

const SoloGame = () => {
  const { playerName: playerNameParam } = useParams();
  const locationState = useLocation().state as {
    modifier: GameModifier;
  } | null;
  const modifier = locationState?.modifier ?? "standard";
  const { board, player, ghostPlayer, gameOver, nextPiece } = useAppSelector(
    (state) => state.game,
  );
  const { score, lines, level } = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [soloRoomId] = useState(
    () => `solo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  );

  const { requestRestartGame } = useMultiplayer(
    soloRoomId,
    playerNameParam ?? "",
    "solo",
    modifier,
  );

  useGameSounds(board.length > 0);

  const renderedBoard = useMemo(
    () =>
      player
        ? getRenderedBoard({ board, player, ghostPlayer, modifier })
        : board,
    [board, player, ghostPlayer, modifier],
  );

  const blocker = useBlocker(!gameOver);

  useEffect(() => {
    if (!playerNameParam) {
      navigate("/", { replace: true });
      return;
    }

    socketMiddleware.connect();

    return () => {
      socketMiddleware.disconnect();
      dispatch(resetGame());
      dispatch(resetPlayerStats());
    };
  }, [playerNameParam, navigate, dispatch]);

  useEffect(() => {
    if (gameOver) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameOver]);

  return (
    <section className="relative z-1 flex min-h-screen flex-1 items-center justify-center px-3 py-6 font-sans sm:px-6">
      {board.length > 0 && (
        <div
          className="flex w-full max-w-5xl flex-col gap-4"
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
                playerName={playerNameParam ?? ""}
              />
            </div>
            <aside className="order-3 flex flex-col gap-3 lg:pl-3">
              <GameStatsDisplay stats={{ score, lines, level }} fields={["level"]} />
              <GameStatsDisplay stats={{ score, lines, level }} fields={["score", "lines"]} />
            </aside>
          </div>
        </div>
      )}

      {gameOver && (
        <GameOverOverlay onRetry={requestRestartGame} level={level} />
      )}
      {blocker.state === "blocked" && <LeaveGameOverlay blocker={blocker} />}
    </section>
  );
};

export default SoloGame;
