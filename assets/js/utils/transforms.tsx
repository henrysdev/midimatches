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

const isArray = function (a: Array<any>): boolean {
  return Array.isArray(a);
};

const isObject = function (o: Object): boolean {
  return o === Object(o) && !isArray(o) && typeof o !== "function";
};

const keysToCamel = function (o: Object): Object {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};

const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

export function formatServerPayload(payload: Object): Object {
  return keysToCamel(payload);
}
