import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../utils/constants";

export const socket: Socket = io(BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
});
