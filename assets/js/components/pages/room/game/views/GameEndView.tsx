import React, { useEffect, useState } from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { WinResult, Player } from "../../../../../types";

interface GameEndViewProps {}

const GameEndView: React.FC<GameEndViewProps> = () => {
  const {
    gameWinners,
    gameRules: {
      viewTimeouts: { gameEnd: gameEndTimeout },
    },
    players,
  } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

  useEffect(() => {
    if (!!gameWinners && !!players) {
      const winnerIdsSet = new Set(gameWinners.winners);
      const newWinningPlayers = players.filter((player) =>
        winnerIdsSet.has(player.musicianId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [gameWinners]);

  return (
    <div>
      <Title title="End of Game" />
      <div>
        {!!winningPlayers && !!gameWinners ? (
          winningPlayers.length > 1 ? (
            <div style={{ margin: "auto" }}>
              <div>
                <strong>Game Tie</strong>
              </div>
              {winningPlayers.map((player) => {
                return (
                  <div key={`winner-${player.playerAlias}`}>
                    {player.playerAlias} with {gameWinners.numPoints} points
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div>
                <strong>Game Winner</strong>
              </div>
              <div>{`${winningPlayers[0].playerAlias} wins game with ${gameWinners.numPoints} total points`}</div>
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
