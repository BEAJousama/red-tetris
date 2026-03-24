import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import { getLeaderboard, persistScores } from "./db";
import { roomManager } from "./roomManager";

const app = express();
const server = createServer(app);

const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin: CLIENT_ORIGIN }));

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

app.get("/api/leaderboard", (req: Request, res: Response) => {
  // const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
  const entries = getLeaderboard();
  res.json({ leaderboard: entries });
});

const CLIENT_BUILD_DIR = path.join(__dirname, "..", "..", "client", "dist");
const CLIENT_INDEX = path.join(CLIENT_BUILD_DIR, "index.html");
const hasClientStatic = fs.existsSync(CLIENT_INDEX);

if (hasClientStatic) {
  app.use(express.static(CLIENT_BUILD_DIR));
}

app.get("/{*splat}", (req: Request, res: Response) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!hasClientStatic) {
    res
      .status(404)
      .type("text")
      .send("API server — open the Vercel frontend URL to play.");
    return;
  }
  res.sendFile(CLIENT_INDEX);
});


io.on("connection", (socket: Socket) => {
  socket.on(
    "join_room",
    (
      payload: {
        roomId: string;
        playerName: string;
        type?: string;
        modifier?: string;
      },
      ack?: (ok: boolean) => void,
    ) => {
      const roomId = payload?.roomId ?? "";
      let playerName = payload.playerName;
      if (!roomId) {
        ack?.(false);
        return;
      }

      const room = roomManager.getOrCreate(roomId);

      if (!room.canJoin()) {
        const reason = room.started ? "game_already_started" : "room_full";
        socket.emit("join_error", { reason });
        ack?.(false);
        return;
      }

      if (room.players.size > 0) {
        const hostMode = room.modifier;
        const joinerMode = payload.modifier;
        if (joinerMode !== undefined && joinerMode !== null && joinerMode !== hostMode) {
          socket.emit("join_error", {
            reason: "host_mode_mismatch",
            forcedMode: hostMode,
          });
          ack?.(false);
          return;
        }
      }

      if (!room.addPlayer(socket.id, playerName, payload.modifier)) {
        socket.emit("join_error", {
          reason: "Player username already exists in the room",
        });
        ack?.(false);
        return;
      }

      roomManager.registerSocket(socket.id, roomId);
      socket.join(roomId);

      const playersList = Array.from(room.players.entries()).map(
        ([id, name]) => ({
          socketId: id,
          name,
        }),
      );

      if (payload.type === "solo") {
        room.startGame(io, false, room.modifier);
      }
      
      const opponentsForJoiner = playersList
        .filter((p) => p.socketId !== socket.id)
        .map((p) => ({ id: p.socketId, name: p.name }));

      socket.emit("joined_room", {
        roomId,
        playerName,
        isHost: room.isHost(socket.id),
        opponents: opponentsForJoiner,
        modifier: room.modifier,
      });

      socket.to(roomId).emit("opponent_joined", {
        id: socket.id,
        name: playerName,
      });

      io.to(roomId).emit("room_players", { players: playersList });
      ack?.(true);
    },
  );

  socket.on(
    "start_game",
    (_payload: { roomId?: string } | undefined, ack?: (ok: boolean) => void) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room || !room.isHost(socket.id)) {
        ack?.(false);
        return;
      }
      if (room.players.size == 1)
      {
        socket.emit("start_error", {reason: "Please wait for more players to join!"})
        return;
      }
      const ok = room.startGame(io, false, room.modifier);
      ack?.(ok);
    },
  );

  socket.on(
    "restart_game",
    (
      _payload: { roomId?: string, type?: string } | undefined,
      ack?: (ok: boolean) => void,
    ) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) {
        ack?.(false);
        return;
      }
      const ok = room.restartGame(io, socket.id, _payload?.type);
      ack?.(ok);
    },
  );

  socket.on("move", (direction: "left" | "right" | "down") => {
    const room = roomManager.getRoomBySocket(socket.id);
    const game = room?.getGame();
    if (game) game.applyMove(socket.id, direction);
  });

  socket.on("rotate", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    const game = room?.getGame();
    if (game) game.applyRotate(socket.id);
  });

  socket.on("hardDrop", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    const game = room?.getGame();
    if (game) game.applyHardDrop(socket.id);
  });


  socket.on("disconnect", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) {
      roomManager.unregisterSocket(socket.id);
      return;
    }

    const roomId = room.roomId;
    const wasHost = room.isHost(socket.id);
    const gameWasStarted = room.started;
    const otherSocketIds = [...room.players.keys()].filter((id) => id !== socket.id);
    const winnerSocketId = otherSocketIds[0] ?? null;
    const winnerName =
      winnerSocketId !== null ? room.players.get(winnerSocketId) ?? null : null;

    let newHostSocketId: string | undefined;
    if (wasHost && otherSocketIds.length > 0) {
      const game = room.getGame();
      if (game) {
        newHostSocketId = otherSocketIds[0];
      } else {
        newHostSocketId = otherSocketIds[0];
      }
    } else if (wasHost) {
      newHostSocketId = undefined;
    } else {
      newHostSocketId = room.hostSocketId ?? undefined;
    }

    let results: Array<{
      playerName: string;
      score: number;
      linesCleared: number;
      level: number;
    }> = [];
    if (gameWasStarted && otherSocketIds.length <= 1) {
      const game = room.getGame();
      room.started = false;
      if (game) {
        const allResults = game.getRoundResults();
        const remainingResults = allResults.filter((r) =>
          otherSocketIds.includes(r.socketId),
        );
        persistScores(
          remainingResults.map((r) => ({
            playerName: r.playerName,
            score: r.score,
            linesCleared: r.linesCleared,
            level: r.level,
          })),
        );
        results = allResults.map((r) => ({
          playerName: r.playerName,
          score: r.score,
          linesCleared: r.linesCleared,
          level: r.level,
        }));

      }
      io.to(roomId).emit("round_over", {
        winnerSocketId,
        winnerName,
        results,
      });
    }

    io.to(roomId).emit("player_left", {
      socketId: socket.id,
      wasHost,
      newHostSocketId,
    });

    roomManager.unregisterSocket(socket.id, newHostSocketId);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

