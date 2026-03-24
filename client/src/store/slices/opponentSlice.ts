import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BoardType } from "../../utils/types";

interface Opponent {
  id: string;
  name: string;
  board: BoardType;
}
interface OpponentState {
  opponnents: Opponent[];
}

const initialState: OpponentState = {
  opponnents: [],
};

const opponentSlice = createSlice({
  name: "opponent",
  initialState,
  reducers: {
    addOpponent: (state, action: PayloadAction<Opponent>) => {
      state.opponnents.push(action.payload);
    },
    removeOpponent: (state, action: PayloadAction<string>) => {
      state.opponnents = state.opponnents.filter(
        (o) => o.id !== action.payload,
      );
    },
    updateOpponentBoard: (
      state,
      action: PayloadAction<{ name: string; board: BoardType }>,
    ) => {
      const opp = state.opponnents.find((o) => o.name === action.payload.name);
      if (opp) opp.board = action.payload.board;
    },
    resetOpponent: () => initialState,
  },
});

export const { addOpponent, removeOpponent, updateOpponentBoard, resetOpponent } =
  opponentSlice.actions;

export default opponentSlice.reducer;
