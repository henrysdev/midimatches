import React from "react";
import {
  PlayersContext,
  GameViewContext,
  ViewDeadlineContext,
  GameRulesContext,
  ScoresContext,
  RoundRecordingStartTimeContext,
} from "../../../../contexts";
import { GameContextType } from "../../../../types";

interface GameSubContextsProps {
  gameContext: GameContextType;
  children?: any;
}

const GameSubContexts: React.FC<GameSubContextsProps> = ({
  gameContext,
  children,
}) => {
  const {
    players = [],
    gameRules,
    viewDeadline,
    gameView,
    scores,
    roundRecordingStartTime,
  } = gameContext;

  return (
    <PlayersContext.Provider value={{ players }}>
      <GameViewContext.Provider value={{ gameView }}>
        <ViewDeadlineContext.Provider value={{ viewDeadline }}>
          <GameRulesContext.Provider value={{ gameRules }}>
            <ScoresContext.Provider value={{ scores }}>
              <RoundRecordingStartTimeContext.Provider
                value={{
                  roundRecordingStartTime,
                }}
              >
                {children}
              </RoundRecordingStartTimeContext.Provider>
            </ScoresContext.Provider>
          </GameRulesContext.Provider>
        </ViewDeadlineContext.Provider>
      </GameViewContext.Provider>
    </PlayersContext.Provider>
  );
};
export { GameSubContexts };
