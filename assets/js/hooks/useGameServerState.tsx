import { useEffect, useState } from "react";
import { Channel } from "phoenix";

import { GAME_VIEW, VIEW_UPDATE_EVENT } from "../constants";
import { GameContextType, ViewUpdatePayload } from "../types";
import { gameViewAtomToEnum, unmarshalBody } from "../utils";

type GameServerStateTuple = [
  GAME_VIEW,
  GameContextType,
  (event: string, payload: Object) => void
];

export function useGameServerState(
  gameChannel: Channel,
  initGameState: GameContextType
): GameServerStateTuple {
  const [currentView, setCurrentView] = useState(GAME_VIEW.GAME_START);
  const [gameContext, setGameContext] = useState(initGameState);

  useEffect(() => {
    gameChannel.on(VIEW_UPDATE_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as ViewUpdatePayload;
      const gameView = gameViewAtomToEnum(gameState.gameView);
      setGameContext(gameState);
      setCurrentView(gameView);
    });
  }, []);

  const pushMessageToServer = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  return [currentView, gameContext, pushMessageToServer];
}
