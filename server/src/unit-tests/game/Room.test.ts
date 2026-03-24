import { Room } from "game/Room";

describe("Room", () => {
  let room: Room;

  beforeEach(() => {
    room = new Room("test-room");
  });

  it("canJoin returns true when not started", () => {
    expect(room.canJoin()).toBe(true);
  });

  it("addPlayer sets first player as host", () => {
    const ok = room.addPlayer("s1", "Obeaj");
    expect(ok).toBe(true);
    expect(room.hostSocketId).toBe("s1");
    expect(room.isHost("s1")).toBe(true);
  });

  it("addPlayer sets second player as non-host", () => {
    room.addPlayer("s1", "Obeaj");
    room.addPlayer("s2", "Yassin");
    expect(room.isHost("s2")).toBe(false);
    expect(room.players.size).toBe(2);
  });

  it("removePlayer reassigns host when host leaves", () => {
    room.addPlayer("s1", "Obeaj");
    room.addPlayer("s2", "Yassin");
    room.removePlayer("s1");
    expect(room.hostSocketId).toBe("s2");
    expect(room.players.has("s1")).toBe(false);
  });

  it("isEmpty returns true when no players", () => {
    expect(room.isEmpty()).toBe(true);
    room.addPlayer("s1", "A");
    expect(room.isEmpty()).toBe(false);
    room.removePlayer("s1");
    expect(room.isEmpty()).toBe(true);
  });
});
