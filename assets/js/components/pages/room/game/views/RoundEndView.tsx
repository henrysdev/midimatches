import React, { useEffect, useState } from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { WinResult, Player } from "../../../../../types";

interface RoundEndViewProps {}

const RoundEndView: React.FC<RoundEndViewProps> = () => {
  const {
    roundWinners,
    roundNum,
    gameRules: {
      viewTimeouts: { roundEnd: roundEndTimeout },
    },
    players,
  } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

  useEffect(() => {
    if (!!roundWinners && !!players) {
      const winnerIdsSet = new Set(roundWinners.winners);
      const newWinningPlayers = players.filter((player) =>
        winnerIdsSet.has(player.musicianId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [roundWinners]);

  return (
    <div>
      <div>
        <Title title={`End of Round ${roundNum}`} />
        <div>
          {!!winningPlayers && !!roundWinners ? (
            winningPlayers.length > 1 ? (
              <div>
                <div>
                  <strong>Round Tie</strong>
                </div>
                {winningPlayers.map((player) => {
                  return (
                    <div key={`winner-${player.musicianId}`}>
                      {player.playerAlias} with {roundWinners.numPoints} votes
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div>
                  <strong>Round Winner</strong>
                </div>
                <div>{`${winningPlayers[0].playerAlias} wins round ${roundNum} with ${roundWinners.numPoints} votes`}</div>
              </div>
            )
          ) : (
            <></>
          )}
        </div>
        <DynamicContent>
          <Timer
            descriptionText={"Next round starting in "}
            duration={roundEndTimeout}
          />
        </DynamicContent>
      </div>
    </div>
  );
};
export { RoundEndView };
