export const EVENTS = {
  // ─── Common (solo + battle) ───────────────────────
  // Emit
  JOIN_ROOM: "join_room",
  MOVE: "move",
  ROTATE: "rotate",
  HARD_DROP: "hardDrop",

  // Listen
  JOINED_ROOM: "joined_room",
  JOIN_ERROR: "join_error",
  RESTART_ERROR: "restart_error",
  GAME_STATE: "gameState",
  ROUND_OVER: "round_over",

  // ─── Battle only ──────────────────────────────────
  // Emit
  START_GAME: "start_game",
  START_ERROR: "start_error",
  RESTART_GAME: "restart_game",

  // Listen
  OPPONENT_JOINED: "opponent_joined",
  PLAYER_JOINED: "player_joined",
  ROOM_PLAYERS: "room_players",
  PLAYER_LEFT: "player_left",
  SPECTRUM_UPDATE: "spectrum_update",
} as const;
