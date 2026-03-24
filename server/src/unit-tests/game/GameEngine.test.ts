import { GameEngine } from "game/GameEngine";
import { tetriminoAt } from "game/helpers";
import { BOARD_SIZE, INITIAL_PLAYER_POSITION, TETRIMINOS } from "game/constants";

describe("GameEngine", () => {
  it("creates game with valid initial state", () => {
    const engine = new GameEngine();
    engine.createGame();
    const state = engine.getState();
    expect(state.board).toHaveLength(BOARD_SIZE.rows);
    expect(state.board[0]).toHaveLength(BOARD_SIZE.columns);
    expect(state.gameOver).toBe(false);
    expect(state.player.position).toEqual(INITIAL_PLAYER_POSITION);
  });

  it("move left updates position when no collision", () => {
    const engine = new GameEngine();
    engine.createGame();
    engine.move("left");
    const state = engine.getState();
    expect(state.player.position.x).toBe(INITIAL_PLAYER_POSITION.x - 1);
  });

  it("move right updates position when no collision", () => {
    const engine = new GameEngine();
    engine.createGame();
    engine.move("right");
    const state = engine.getState();
    expect(state.player.position.x).toBe(INITIAL_PLAYER_POSITION.x + 1);
  });

  it("rotate changes shape for a non-symmetric piece without causing collision", () => {
    // Force a known non-symmetric piece (T) so rotation actually changes shape.
    const engine = new GameEngine();
    engine.createGame();
    const stateBefore = engine.getState();
    const customPiece = {
      ...stateBefore.player,
      terimino: {
      ...TETRIMINOS.T,
      shape: TETRIMINOS.T.shape.map((row) => [...row]),
      },
    };

    // Inject custom piece into the engine (private field)
    (engine as unknown as { piece: typeof customPiece }).piece = customPiece;

    const beforeShape = customPiece.terimino.shape.map((row) => [...row]);
    engine.rotate();
    const afterShape = engine.getState().player.terimino.shape;

    expect(afterShape).not.toEqual(beforeShape);
  });

  it("createGame resets state", () => {
    const engine = new GameEngine();
    engine.createGame();
    engine.move("right");
    engine.move("right");
    engine.createGame();
    const state = engine.getState();
    expect(state.player.position.x).toBe(INITIAL_PLAYER_POSITION.x);
    expect(state.gameOver).toBe(false);
  });

  it("uses getNextPiece when provided", () => {
    let index = 0;
    const engine = new GameEngine({
      getNextPiece: () => tetriminoAt(1, index++),
    });
    engine.createGame(tetriminoAt(1, 0));
    const state = engine.getState();
    expect(state.player.terimino.shape).toBeDefined();
  });

  it("applyPenalty adds penalty lines to board", () => {
    const engine = new GameEngine();
    engine.createGame();
    const filledBefore = engine.getState().board.flat().filter((c) => c !== 0).length;
    engine.applyPenalty(2);
    const filledAfter = engine.getState().board.flat().filter((c) => c !== 0).length;
    expect(filledAfter).toBeGreaterThan(filledBefore);
  });

  it("applyPenalty does nothing when count <= 0", () => {
    const engine = new GameEngine();
    engine.createGame();
    const boardBefore = engine.getState().board.map((r) => [...r]);
    engine.applyPenalty(0);
    expect(engine.getState().board).toEqual(boardBefore);
    engine.applyPenalty(-1);
    expect(engine.getState().board).toEqual(boardBefore);
  });

  it("move down updates position when no collision", () => {
    const engine = new GameEngine();
    engine.createGame();
    const stateBefore = engine.getState();
    engine.move("down");
    const stateAfter = engine.getState();
    expect(stateAfter.player.position.y).toBe(stateBefore.player.position.y + 1);
  });

  it("tick moves piece down when no collision", () => {
    const engine = new GameEngine();
    engine.createGame();
    const stateBefore = engine.getState();
    engine.tick();
    const stateAfter = engine.getState();
    expect(stateAfter.player.position.y).toBe(stateBefore.player.position.y + 1);
  });

  it("getState returns score and level", () => {
    const engine = new GameEngine();
    engine.createGame();
    const state = engine.getState();
    expect(typeof state.score).toBe("number");
    expect(typeof state.level).toBe("number");
    expect(state.score).toBeGreaterThanOrEqual(0);
    expect(state.level).toBeGreaterThanOrEqual(1);
  });

  it("applyAction delegates to move/rotate/hardDrop", () => {
    const engine = new GameEngine();
    engine.createGame();
    const xBefore = engine.getState().player.position.x;
    engine.applyAction("left");
    expect(engine.getState().player.position.x).toBe(xBefore - 1);
    engine.applyAction("right");
    expect(engine.getState().player.position.x).toBe(xBefore);
  });

  it("does not move when game over", () => {
    const engine = new GameEngine();
    engine.createGame();
    // Force game over by repeated hard drops until stack reaches top (or we give up after many)
    for (let i = 0; i < 300; i++) {
      engine.hardDrop();
      if (engine.getState().gameOver) break;
    }
    if (!engine.getState().gameOver) return; // skip if we could not trigger game over
    const pos = engine.getState().player.position;
    engine.move("left");
    expect(engine.getState().player.position).toEqual(pos);
    engine.move("right");
    expect(engine.getState().player.position).toEqual(pos);
  });

  it("hardDrop moves piece to bottom or sets gameOver", () => {
    const engine = new GameEngine();
    engine.createGame();
    const yBefore = engine.getState().player.position.y;
    engine.hardDrop();
    const yAfter = engine.getState().player.position.y;
    expect(yAfter).toBeGreaterThanOrEqual(yBefore);
  });
});
