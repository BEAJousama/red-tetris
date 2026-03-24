import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { playHardDrop, playMove, playRotate } from "../audio/gameAudio";
import { EVENTS } from "../socket/events";
import { socketMiddleware } from "../socket/socketMiddleware";
import {
  setBoard,
  setGameOver,
  setGhostPlayer,
  setNextPiece,
  setPlayer,
  setWinner,
} from "../store/slices/gameSlice";
import {
  addOpponent,
  removeOpponent,
  updateOpponentBoard,
} from "../store/slices/opponentSlice";
import { setPlayerIdentity, setPlayerStats } from "../store/slices/playerSlice";
import type { BoardType, GameMode, GameModifier } from "../utils/types";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";

const getJoinErrorMessage = (reason?: string, forcedMode?: string): string => {
  switch (reason) {
    case "game_already_started":
      return "This match has already started.";
    case "room_full":
      return "This room is full.";
    case "host_mode_mismatch":
      return `This room is using ${forcedMode?.toUpperCase()} mode. Please choose it or join another room.`;
    case "Player username already exists in the room":
      return "This username is already taken in the room.";
    default:
      return "Unable to join this room.";
  }
};

const getStartErrorMessage = (reason?: string): string => {
  switch (reason) {
    case "Please wait for more players to join!":
      return "Please wait for more players to join!";
    default:
      return "Unable to start the game.";
  }
};

const getRestartErrorMessage = (reason?: string): string => {
  switch (reason) {
    case "Only host could restart the game!":
      return "Only the new host can restart the game.";
    case "Game already started!":
      return "A game is already in progress.";
    case "Wait for opponents to join!":
      return "Wait for opponents to join before restarting.";
    default:
      return "Unable to restart the game.";
  }
};

export const useMultiplayer = (
  roomId: string,
  playerName: string,
  type: GameMode,
  modifier: GameModifier,
) => {
  const [isConnected, setIsConnected] = useState<boolean>(
    socketMiddleware.isConnected(),
  );
  const [canStartGame, setCanStartGame] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [startError, setStartError] = useState<string | null>(null);
  const [restartError, setRestartError] = useState<string | null>(null);
  const { isHost } = useAppSelector((state) => state.player);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    socketMiddleware.onConnect(handleConnect);

    return () => {
      socketMiddleware.offConnect(handleConnect);
    };
  }, []);

  useEffect(() => {
    if (!isConnected || !roomId || !playerName) return;
    socketMiddleware.joinRoom({ roomId, playerName, type, modifier });
  }, [isConnected, roomId, playerName, type, modifier, navigate]);

  const requestStartGame = useCallback(() => {
    socketMiddleware.startGame(roomId, (ok: boolean) => {
      if (ok) {
        setStartError(null);
      } else {
        console.log("Failed to start game");
      }
    });
  }, [roomId]);

  const requestRestartGame = useCallback(() => {
    socketMiddleware.restartGame(roomId, type, (ok: boolean) => {
      if (ok) {
        dispatch(setGameOver(false));
        dispatch(setWinner(null));
        setRestartError(null);
      } else {
        console.log("Failed to restart game");
      }
    });
  }, [roomId, type, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat && (e.key === "ArrowUp" || e.key === " ")) return;
      switch (e.key) {
        case "ArrowLeft":
          playMove();
          socketMiddleware.move("left");
          break;
        case "ArrowRight":
          playMove();
          socketMiddleware.move("right");
          break;
        case "ArrowDown":
          playMove();
          socketMiddleware.move("down");
          break;
        case "ArrowUp":
          playRotate();
          socketMiddleware.rotate();
          break;
        case " ":
          playHardDrop();
          socketMiddleware.hardDrop();
          break;
      }
    };

    // ─── Common ───────────────────────────────────────
    socketMiddleware.on(
      EVENTS.JOINED_ROOM,
      ({ roomId, playerName, isHost, opponents }) => {
        dispatch(setPlayerIdentity({ name: playerName, roomId, isHost }));
        setCanStartGame(isHost);
        opponents.forEach((opponent: { id: string; name: string }) =>
          dispatch(addOpponent({ ...opponent, board: [] })),
        );
      },
    );

    socketMiddleware.on(
      EVENTS.JOIN_ERROR,
      ({
        reason,
        forcedMode,
      }: {
        reason?: string;
        forcedMode?: GameModifier;
      }) => {
        dispatch(setGameOver(true));
        navigate("/", {
          state: {
            error: getJoinErrorMessage(reason, forcedMode),
            isJoinError: true,
          },
        });
        socketMiddleware.disconnect();
      },
    );

    socketMiddleware.on(
      EVENTS.RESTART_ERROR,
      ({ reason }: { reason?: string }) => {
        setRestartError(getRestartErrorMessage(reason));
      },
    );

    socketMiddleware.on(
      EVENTS.GAME_STATE,
      ({
        board,
        player,
        ghostPlayer,
        nextPiece,
        gameOver,
        score,
        linesCleared,
        level,
      }) => {
        dispatch(setBoard(board));
        dispatch(setPlayer(player));
        dispatch(setGhostPlayer(ghostPlayer));
        dispatch(setNextPiece(nextPiece ?? null));
        dispatch(setGameOver(gameOver));
        dispatch(setPlayerStats({ score, lines: linesCleared, level }));
      },
    );

    socketMiddleware.on(
      EVENTS.ROUND_OVER,
      ({ winnerSocketId, newHostSocketId }) => {
        const isHostNow = newHostSocketId === socketMiddleware.getId();
        dispatch(setGameOver(true));
        dispatch(setWinner(winnerSocketId === socketMiddleware.getId()));
        dispatch(
          setPlayerIdentity({
            name: playerName,
            roomId,
            isHost: isHostNow,
          }),
        );
        setCanStartGame(isHostNow);
      },
    );

    // ─── Battle only ──────────────────────────────────
    if (type === "battle") {
      socketMiddleware.on(EVENTS.OPPONENT_JOINED, ({ id, name }) => {
        setStartError(null);
        dispatch(addOpponent({ id, name, board: [] }));
      });

      socketMiddleware.on(
        EVENTS.START_ERROR,
        ({ reason }: { reason?: string }) => {
          setStartError(getStartErrorMessage(reason));
        },
      );

      socketMiddleware.on(
        EVENTS.PLAYER_LEFT,
        ({ socketId, newHostSocketId }) => {
          dispatch(removeOpponent(socketId));
          setPlayerCount((prev) => prev - 1);
          if (newHostSocketId === socketMiddleware.getId()) {
            dispatch(
              setPlayerIdentity({ name: playerName, roomId, isHost: true }),
            );
            setCanStartGame(true);
          }
        },
      );

      socketMiddleware.on(
        EVENTS.ROOM_PLAYERS,
        ({
          players,
        }: {
          players: Array<{ socketId: string; name: string }>;
        }) => {
          const count = players.length;
          setPlayerCount(count);
          setCanStartGame(isHost && count > 1);
        },
      );

      socketMiddleware.on(
        EVENTS.SPECTRUM_UPDATE,
        (spectra: Array<{ playerName: string; spectrum: BoardType }>) => {
          for (const { playerName: name, spectrum } of spectra) {
            if (name === playerName) continue;
            dispatch(updateOpponentBoard({ name, board: spectrum }));
          }
        },
      );
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      socketMiddleware.offAll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, playerName, isHost, type, navigate, roomId]);

  return {
    isConnected,
    canStartGame,
    playerCount,
    startError,
    restartError,
    requestStartGame,
    requestRestartGame,
  };
};
