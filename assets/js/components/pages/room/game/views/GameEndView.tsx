import React, { useEffect, useState } from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { WinResult } from "../../../../../types";

interface GameEndViewProps {}

const GameEndView: React.FC<GameEndViewProps> = () => {
  const {
    gameWinners,
    gameRules: {
      viewTimeouts: { gameEnd: gameEndTimeout },
    },
  } = useGameContext();

  return (
    <div>
      <Title title="End of Game" />
      <div>
        {!!gameWinners ? (
          gameWinners.winners.length > 1 ? (
            <div>
              <div>Game Tie</div>
              {gameWinners.winners.map((winnerId) => {
                return (
                  <div key={`winner-${winnerId}`}>
                    {winnerId} with {gameWinners.numPoints} points
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div>Game Winner</div>
              <div>{`${gameWinners.winners[0]} wins game with ${gameWinners.numPoints} total points`}</div>
            </div>
          )
        ) : (
          <></>
        )}
      </div>
      <DynamicContent />
    </div>
  );
};
export { GameEndView };
