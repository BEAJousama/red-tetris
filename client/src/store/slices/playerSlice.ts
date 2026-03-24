import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  name: string;
  roomId: string;
  isHost: boolean;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

const initialState: PlayerState = {
  name: "",
  roomId: "",
  isHost: false,
  score: 0,
  lines: 0,
  level: 1,
  isGameOver: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerIdentity: (
      state,
      action: PayloadAction<{ name: string; roomId: string; isHost: boolean }>,
    ) => {
      state.name = action.payload.name;
      state.roomId = action.payload.roomId;
      state.isHost = action.payload.isHost;
    },
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setPlayerStats: (
      state,
      action: PayloadAction<{ score: number; lines: number; level: number }>,
    ) => {
      state.score = action.payload.score;
      state.lines = action.payload.lines;
      state.level = action.payload.level;
    },
    resetPlayerStats: () => initialState,
  },
});

export const {
  setPlayerIdentity,
  setPlayerName,
  setRoomId,
  setPlayerStats,
  resetPlayerStats,
} = playerSlice.actions;

export default playerSlice.reducer;
