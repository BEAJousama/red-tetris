import type { GameMode, GameModifier } from "../utils/types";
import { EVENTS } from "./events";
import { socket } from "./socket";

export const socketMiddleware = {
  connect: () => socket.connect(),
  disconnect: () => socket.disconnect(),
  onConnect: (handler: () => void) => socket.on("connect", handler),
  offConnect: (handler: () => void) => socket.off("connect", handler),
  isConnected: () => socket.connected,
  getId: () => socket.id,

  // emit
  joinRoom: (payload: {
    roomId: string;
    playerName: string;
    type: GameMode;
    modifier: GameModifier;
  }) => socket.emit(EVENTS.JOIN_ROOM, payload),
  move: (direction: "left" | "right" | "down") =>
    socket.emit(EVENTS.MOVE, direction),
  rotate: () => socket.emit(EVENTS.ROTATE),
  hardDrop: () => socket.emit(EVENTS.HARD_DROP),
  startGame: (roomId: string, cb: (ok: boolean) => void) =>
    socket.emit(EVENTS.START_GAME, { roomId }, cb),
  startError: (roomId: string, cb: (ok: boolean) => void) =>
    socket.emit(EVENTS.START_ERROR, { roomId }, cb),
  restartGame: (roomId: string, type: GameMode, cb: (ok: boolean) => void) =>
    socket.emit(EVENTS.RESTART_GAME, { roomId, type }, cb),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, handler: (...args: any[]) => void) =>
    socket.on(event, handler),
  off: (event: string) => socket.off(event),
  offAll: () => Object.values(EVENTS).forEach((event) => socket.off(event)),
};
