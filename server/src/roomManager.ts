import { Room } from "./game/Room";

class RoomManagerClass {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>();

  getOrCreate(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId);
      this.rooms.set(roomId, room);
    }
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocket(socketId: string): Room | undefined {

    const roomId = this.socketToRoom.get(socketId.trim());
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  registerSocket(socketId: string, roomId: string): void {
    this.socketToRoom.set(socketId, roomId);
  }

  unregisterSocket(socketId: string, newHostSocketId?: string): void {
    const roomId = this.socketToRoom.get(socketId);
    this.socketToRoom.delete(socketId);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        if (newHostSocketId && room.isHost(socketId)) {
          room.hostSocketId = newHostSocketId;
        }
        room.removePlayer(socketId, !!newHostSocketId);
        if (room.isEmpty()) this.rooms.delete(roomId);
      }
    }
  }
}

export const roomManager = new RoomManagerClass();
