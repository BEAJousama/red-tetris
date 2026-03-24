import type { BoardType, GameModifier, PlayerType } from "./types";

export const getRenderedBoard = ({
  board,
  player,
  ghostPlayer,
  modifier,
}: {
  board: BoardType;
  player: PlayerType;
  ghostPlayer: PlayerType | null;
  modifier: GameModifier;
}): BoardType => {
  const newBoard = board.map((row) =>
    row.map((cell) => (modifier === "invisible" ? 0 : cell)),
  );

  if (ghostPlayer) {
    ghostPlayer.terimino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const bY = y + ghostPlayer.position.y;
          const bX = x + ghostPlayer.position.x;
          if (newBoard[bY]?.[bX] === 0) {
            newBoard[bY][bX] = `ghost:${ghostPlayer.terimino.colorClass}`;
          }
        }
      });
    });
  }

  player.terimino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const bY = y + player.position.y;
        const bX = x + player.position.x;
        if (newBoard[bY]?.[bX] !== undefined) {
          newBoard[bY][bX] = player.terimino.colorClass;
        }
      }
    });
  });

  return newBoard;
};
