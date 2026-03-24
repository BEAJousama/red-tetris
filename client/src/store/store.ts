import { configureStore } from "@reduxjs/toolkit";
import gameSlice from "./slices/gameSlice";
import opponentSlice from "./slices/opponentSlice";
import playerSlice from "./slices/playerSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    game: gameSlice,
    player: playerSlice,
    opponent: opponentSlice,
    settings: settingsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
