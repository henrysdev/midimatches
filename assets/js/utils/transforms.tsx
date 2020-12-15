import { GAME_VIEW } from "../constants/index";

export function gameViewAtomToEnum(atom: string): any {
  switch (atom) {
    case "pregame_lobby":
      return GAME_VIEW.PREGAME_LOBBY;
    case "game_start":
      return GAME_VIEW.GAME_START;
    case "recording":
      return GAME_VIEW.RECORDING;
    case "playback_voting":
      return GAME_VIEW.PLAYBACK_VOTING;
    case "game_end":
      return GAME_VIEW.GAME_END;
  }
}
