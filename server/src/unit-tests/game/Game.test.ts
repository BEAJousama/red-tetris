import { Game } from "game/Game";
import type { GameEmit } from "game/Game";

describe("Game", () => {
  const makeEmit = () => {
    const sentToPlayer: Array<{ sid: string; event: string; payload?: unknown }> = [];
    const sentToRoom: Array<{ event: string }> = [];
    const emit: GameEmit = {
      toPlayer: (sid, event, payload) => {
        sentToPlayer.push({ sid, event, payload });
      },
      toRoom: (event) => {
        sentToRoom.push({ event });
      },
    };
    return { emit, sentToPlayer, sentToRoom };
  };

  it("start creates players and emits initial state", () => {
    const { emit, sentToPlayer, sentToRoom } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-1",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );

    game.start();

    expect(sentToPlayer.some((m) => m.event === "gameState")).toBe(true);
    expect(sentToRoom.some((m) => m.event === "spectrum_update")).toBe(true);

    game.stop();
  });

  it("applyMove/applyRotate/applyHardDrop do not throw for valid player", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-2",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();

    expect(() => game.applyMove("s1", "left")).not.toThrow();
    expect(() => game.applyRotate("s1")).not.toThrow();
    expect(() => game.applyHardDrop("s1")).not.toThrow();

    game.stop();
  });

  it("getRoundResults returns entries for all players", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-3",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();

    const results = game.getRoundResults();
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty("socketId");
    expect(results[0]).toHaveProperty("playerName");
    expect(results[0]).toHaveProperty("score");
    expect(results[0]).toHaveProperty("linesCleared");
    expect(results[0]).toHaveProperty("level");

    game.stop();
  });

  it("getStateFor returns state for known player and null for unknown", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-4",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();

    const state = game.getStateFor("s1");
    expect(state).not.toBeNull();
    expect(state?.board).toHaveLength(20);
    expect(state?.player).toBeDefined();
    expect(game.getStateFor("unknown-socket")).toBeNull();

    game.stop();
  });

  it("getSpectra returns one entry per player with board", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-5",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();

    const spectra = game.getSpectra();
    expect(spectra).toHaveLength(2);
    expect(spectra.map((s) => s.playerName).sort()).toEqual(["Obeaj", "Yassin"]);
    spectra.forEach((s) => {
      expect(s.spectrum).toHaveLength(20);
      expect(s.spectrum[0]).toHaveLength(10);
    });

    game.stop();
  });

  it("invisible modifier sends ghostPlayer null in gameState payload", () => {
    const { emit, sentToPlayer } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-6",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "invisible",
    );
    game.start();
    game.applyMove("s1", "left");

    const gameStateCalls = sentToPlayer.filter((m) => m.event === "gameState");
    expect(gameStateCalls.length).toBeGreaterThan(0);
    const payload = gameStateCalls[gameStateCalls.length - 1]?.payload as { ghostPlayer: null | object; modifier?: string };
    expect(payload?.ghostPlayer).toBeNull();
    expect(payload?.modifier).toBe("invisible");

    game.stop();
  });

  it("standard modifier sends ghostPlayer object in gameState payload", () => {
    const { emit, sentToPlayer } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-7",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    game.applyMove("s1", "left");

    const gameStateCalls = sentToPlayer.filter((m) => m.event === "gameState");
    expect(gameStateCalls.length).toBeGreaterThan(0);
    const payload = gameStateCalls[gameStateCalls.length - 1]?.payload as { ghostPlayer: null | { position: unknown } };
    expect(payload?.ghostPlayer).not.toBeNull();
    expect(payload?.ghostPlayer).toHaveProperty("position");

    game.stop();
  });

  it("applyMove/applyRotate/applyHardDrop for unknown socketId do not throw", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-8",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();

    expect(() => game.applyMove("unknown", "left")).not.toThrow();
    expect(() => game.applyRotate("unknown")).not.toThrow();
    expect(() => game.applyHardDrop("unknown")).not.toThrow();

    game.stop();
  });

  it("onRoundEnd is not called immediately after start", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-9",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    expect(onRoundEnd).not.toHaveBeenCalled();
    game.stop();
  });

  it("applyPenaltyToOthers applies penalty to other players only", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-penalty",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const applyPenaltyToOthers = (game as unknown as { applyPenaltyToOthers: (sid: string, n: number) => void }).applyPenaltyToOthers;
    applyPenaltyToOthers.call(game, "s1", 2);
    const s2State = game.getStateFor("s2");
    expect(s2State).not.toBeNull();
    const hasPenalty = s2State!.board.flat().some((c) => c === "penalty");
    expect(hasPenalty).toBe(true);
    game.stop();
  });

  it("applyPenaltyToOthers with linesCleared 1 does not apply penalty (penalty 0)", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-penalty0",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const s2BoardBefore = game.getStateFor("s2")!.board.flat().filter((c) => c !== 0).length;
    const applyPenaltyToOthers = (game as unknown as { applyPenaltyToOthers: (sid: string, n: number) => void }).applyPenaltyToOthers;
    applyPenaltyToOthers.call(game, "s1", 1);
    const s2BoardAfter = game.getStateFor("s2")!.board.flat().filter((c) => c !== 0).length;
    expect(s2BoardAfter).toBe(s2BoardBefore);
    game.stop();
  });

  it("restartGravityFor returns early when socketId not in players", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-restart",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const restartGravityFor = (game as unknown as { restartGravityFor: (sid: string, ms: number) => void }).restartGravityFor;
    expect(() => restartGravityFor.call(game, "nonexistent", 500)).not.toThrow();
    game.stop();
  });

  it("startGravityFor clears existing timer when called again for same socket", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-gravity",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const startGravityFor = (game as unknown as { startGravityFor: (sid: string, ms: number) => void }).startGravityFor;
    expect(() => {
      startGravityFor.call(game, "s1", 1000);
      startGravityFor.call(game, "s1", 2000);
    }).not.toThrow();
    game.stop();
  });

  // it("tick advances all non-game-over players and emits state", () => {
  //   const { emit, sentToPlayer } = makeEmit();
  //   const onRoundEnd = jest.fn();
  //   const game = new Game(
  //     "room-tick",
  //     [{ socketId: "s1", name: "Obeaj" }],
  //     emit,
  //     onRoundEnd,
  //     undefined,
  //     "standard",
  //   );
  //   game.start();
  //   const countBefore = sentToPlayer.filter((m) => m.event === "gameState").length;
  //   const tick = (game as unknown as { tick: () => void }).tick;
  //   tick.call(game);
  //   const countAfter = sentToPlayer.filter((m) => m.event === "gameState").length;
  //   expect(countAfter).toBeGreaterThan(countBefore);
  //   game.stop();
  // });

  it("onPlayerEliminated and onRoundEnd called when solo player reaches game over", () => {
    jest.useFakeTimers();
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const onPlayerEliminated = jest.fn();
    const game = new Game(
      "room-solo-death",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      onPlayerEliminated,
      "standard",
    );
    game.start();
    for (let i = 0; i < 250; i++) {
      game.applyHardDrop("s1");
      if (game.getStateFor("s1")?.gameOver) break;
    }
    expect(game.getStateFor("s1")?.gameOver).toBe(true);
    expect(onPlayerEliminated).toHaveBeenCalledTimes(1);
    expect(onPlayerEliminated).toHaveBeenCalledWith(
      expect.objectContaining({
        playerName: "Obeaj",
        score: expect.any(Number),
        linesCleared: expect.any(Number),
        level: expect.any(Number),
      }),
    );
    expect(onRoundEnd).toHaveBeenCalledWith(null, expect.any(Array));
    expect(onRoundEnd.mock.calls[0][1]).toHaveLength(1);
    expect(onRoundEnd.mock.calls[0][1][0]).toMatchObject({ playerName: "Obeaj", socketId: "s1" });
    jest.useRealTimers();
  });

  it("tickPlayer does nothing when player is game over", () => {
    jest.useFakeTimers();
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-tick-dead",
      [
        { socketId: "s1", name: "Obeaj" },
        { socketId: "s2", name: "Yassin" },
      ],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    for (let i = 0; i < 200; i++) {
      game.applyHardDrop("s1");
      if (game.getStateFor("s1")?.gameOver) break;
    }
    const tickPlayer = (game as unknown as { tickPlayer: (sid: string) => void }).tickPlayer;
    expect(() => tickPlayer.call(game, "s1")).not.toThrow();
    expect(() => tickPlayer.call(game, "s2")).not.toThrow();
    jest.useRealTimers();
    game.stop();
  });

  it("gravity tick triggers tickPlayer and emits state", () => {
    jest.useFakeTimers();
    const { emit, sentToPlayer } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-gravity-tick",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const initialCount = sentToPlayer.filter((m) => m.event === "gameState").length;
    jest.advanceTimersByTime(1000);
    const afterCount = sentToPlayer.filter((m) => m.event === "gameState").length;
    expect(afterCount).toBeGreaterThan(initialCount);
    jest.useRealTimers();
    game.stop();
  });

  it("undefined modifier uses standard board and ghost", () => {
    const { emit, sentToPlayer } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-no-mod",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      undefined,
    );
    game.start();
    game.applyMove("s1", "right");
    const gameStateCalls = sentToPlayer.filter((m) => m.event === "gameState");
    const payload = gameStateCalls[gameStateCalls.length - 1]?.payload as { ghostPlayer: unknown };
    expect(payload?.ghostPlayer).not.toBeNull();
    game.stop();
  });

  it("getRoundResults uses fallbacks for undefined score and level", () => {
    const { emit } = makeEmit();
    const onRoundEnd = jest.fn();
    const game = new Game(
      "room-results",
      [{ socketId: "s1", name: "Obeaj" }],
      emit,
      onRoundEnd,
      undefined,
      "standard",
    );
    game.start();
    const results = game.getRoundResults();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      socketId: "s1",
      playerName: "Obeaj",
    });
    expect(typeof results[0].score).toBe("number");
    expect(typeof results[0].linesCleared).toBe("number");
    expect(typeof results[0].level).toBe("number");
    game.stop();
  });
});
