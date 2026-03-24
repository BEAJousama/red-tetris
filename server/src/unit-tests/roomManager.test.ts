import { roomManager } from "roomManager";
import { Room } from "game/Room";

describe("roomManager", () => {
  it("getOrCreate returns same Room instance for same id", () => {
    const a = roomManager.getOrCreate("r1");
    const b = roomManager.getOrCreate("r1");
    expect(a).toBeInstanceOf(Room);
    expect(b).toBe(a);
  });

  it("registerSocket and getRoomBySocket map socket to room", () => {
    const room = roomManager.getOrCreate("room-abc");
    room.addPlayer("s1", "Obeaj");

    roomManager.registerSocket("s1", "room-abc");
    const found = roomManager.getRoomBySocket("s1");
    expect(found).toBe(room);
  });

  it("unregisterSocket removes player from room and deletes empty room", () => {
    const roomId = "room-unregister";
    const room = roomManager.getOrCreate(roomId);
    room.addPlayer("s1", "Obeaj");
    roomManager.registerSocket("s1", roomId);

    roomManager.unregisterSocket("s1");

    // Room should be deleted when empty
    const shouldBeUndefined = roomManager.getRoom(roomId);
    expect(shouldBeUndefined).toBeUndefined();
  });

  it("unregisterSocket with newHostSocketId reassigns host before removal", () => {
    const roomId = "room-host-reassign";
    const room = roomManager.getOrCreate(roomId);
    room.addPlayer("s1", "Obeaj");
    room.addPlayer("s2", "Yassin");
    expect(room.hostSocketId).toBe("s1");

    roomManager.registerSocket("s1", roomId);
    roomManager.registerSocket("s2", roomId);

    roomManager.unregisterSocket("s1", "s2");

    // After host leaves, s2 should become host and room should still exist
    const remainingRoom = roomManager.getRoom(roomId);
    expect(remainingRoom).toBeDefined();
    expect(remainingRoom?.hostSocketId).toBe("s2");
  });
});
