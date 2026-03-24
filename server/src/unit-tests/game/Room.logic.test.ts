import type { Server } from "socket.io";
import { Room } from "game/Room";

let capturedOnRoundEnd:
  | ((
      winnerSocketId: string | null,
      results: Array<{
        socketId: string;
        playerName: string;
        score: number;
        linesCleared: number;
        level: number;
      }>,
    ) => void)
  | null = null;

const mockStop = jest.fn();

jest.mock("game/Game", () => {
  return {
    Game: jest.fn().mockImplementation(
      (
        _roomId: string,
        _playerInfos: Array<{ socketId: string; name: string }>,
        _emit: unknown,
        onRoundEnd: typeof capturedOnRoundEnd,
      ) => {
        capturedOnRoundEnd = onRoundEnd;
        return {
          start: jest.fn(),
          stop: mockStop,
          getRoundResults: jest.fn().mockReturnValue([]),
        };
      },
    ),
  };
});

describe("Room game flow and restart (last survivor host)", () => {
  let room: Room;
  let io: Server;

  beforeEach(() => {
    room = new Room("room-logic");
    io = {
      to: () =>
        ({
          emit: jest.fn(),
        }) as any,
    } as any;
    capturedOnRoundEnd = null;
    mockStop.mockClear();
  });

  it("assigns winner (last survivor) as host on round end and allows restart", () => {
    room.addPlayer("s1", "Obeaj");
    room.addPlayer("s2", "Yassin");

    const startOk = room.startGame(io, false, "standard");
    expect(startOk).toBe(true);
    expect(typeof capturedOnRoundEnd).toBe("function");

    // Simulate Yassin as last survivor / winner
    capturedOnRoundEnd?.("s2", [
      {
        socketId: "s1",
        playerName: "Obeaj",
        score: 0,
        linesCleared: 0,
        level: 1,
      },
      {
        socketId: "s2",
        playerName: "Yassin",
        score: 1000,
        linesCleared: 10,
        level: 2,
      },
    ]);

    // Winner should now be host
    expect(room.hostSocketId).toBe("s2");

    // Restart should be allowed for the winner/host
    const restartOk = room.restartGame(io, "s2");
    expect(restartOk).toBe(true);
  });

  it("rejects restart from non-host and when only one player", () => {
    // Single player room
    room.addPlayer("s1", "Solo");
    const startOk = room.startGame(io, false, "standard");
    expect(startOk).toBe(true);

    // End round with s1 as winner; host is s1
    capturedOnRoundEnd?.("s1", [
      {
        socketId: "s1",
        playerName: "Solo",
        score: 500,
        linesCleared: 5,
        level: 1,
      },
    ]);
    expect(room.hostSocketId).toBe("s1");

    // Only one player left, restart should be rejected by size check
    expect(room.restartGame(io, "s1")).toBe(false);

    // Add a second player; host is still s1
    room.addPlayer("s2", "Yassin");
    // Non-host cannot restart
    expect(room.restartGame(io, "s2")).toBe(false);
  });
});
