import { useEffect, useState } from "react";
import { Channel, Push } from "phoenix";

import { GAME_VIEW, GAME_UPDATE_EVENT } from "../constants";
import { GameContextType, GameUpdatePayload, Milliseconds } from "../types";
import { gameViewAtomToEnum, unmarshalBody, msToMicros } from "../utils";

type GameServerStateTuple = [
  GAME_VIEW,
  GameContextType,
  (event: string, payload: Object) => Push | undefined
];

export function useGameServerState(
  gameChannel: Channel,
  initGameState: GameContextType,
  clockOffset: Milliseconds
): GameServerStateTuple {
  const [currentView, setCurrentView] = useState(GAME_VIEW.GAME_START);
  const [gameContext, setGameContext] = useState(initGameState);

  useEffect(() => {
    gameChannel.on(GAME_UPDATE_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as GameUpdatePayload;
      gameState.viewDeadline += clockOffset;
      if (!!gameState.roundRecordingStartTime) {
        gameState.roundRecordingStartTime += clockOffset;
      }
      const gameView = gameViewAtomToEnum(gameState.gameView);
      setGameContext(gameState);
      setCurrentView(gameView);
    });
  }, []);

  const pushMessageToServer = (
    event: string,
    payload: Object
  ): Push | undefined => {
    if (!!gameChannel) {
      return gameChannel.push(event, payload);
    }
  };

  return [currentView, gameContext, pushMessageToServer];
}
