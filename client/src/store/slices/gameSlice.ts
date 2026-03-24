import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BoardType, PlayerType, Tetrimino } from "../../utils/types";

interface GameState {
  board: BoardType;
  player: PlayerType | null;
  ghostPlayer: PlayerType | null;
  nextPiece: Tetrimino | null;
  gameOver: boolean;
  winner: boolean | null;
}

const initialState: GameState = {
  board: [],
  player: null,
  ghostPlayer: null,
  nextPiece: null,
  gameOver: false,
  winner: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setBoard: (state, action: PayloadAction<BoardType>) => {
      state.board = action.payload;
    },
    setPlayer: (state, action: PayloadAction<PlayerType>) => {
      state.player = action.payload;
    },
    setGhostPlayer: (state, action: PayloadAction<PlayerType | null>) => {
      state.ghostPlayer = action.payload;
    },
    setNextPiece: (state, action: PayloadAction<Tetrimino | null>) => {
      state.nextPiece = action.payload;
    },
    setGameOver: (state, action: PayloadAction<boolean>) => {
      state.gameOver = action.payload;
    },
    setWinner: (state, action: PayloadAction<boolean | null>) => {
      state.winner = action.payload;
    },
    resetGame: () => initialState,
  },
});

export const {
  setBoard,
  setPlayer,
  setGhostPlayer,
  setNextPiece,
  setGameOver,
  setWinner,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
