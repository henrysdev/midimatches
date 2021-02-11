import React, { useMemo } from "react";
import { MediumTitle } from "../../../common";
import { WinResult, Player } from "../../../../types";

interface WinResultTextProps {
  winResult: WinResult;
  winningPlayers: Array<Player>;
  endOfGame: boolean;
  roundNum?: number;
}

const WinResultText: React.FC<WinResultTextProps> = ({
  winResult,
  winningPlayers,
  endOfGame,
  roundNum = 0,
}) => {
  const winners = useMemo(() => {
    return winningPlayers.length > 0
      ? winningPlayers
      : [{ playerAlias: "missing player", musicianId: "-1" }];
  }, [roundNum]);

  return (
    <div style={{ textAlign: "center" }}>
      {winners.length > 1 ? (
        <div>
          {endOfGame ? (
            <MediumTitle title="Game Tie" />
          ) : (
            <MediumTitle title="Round Tie" />
          )}

          {winners.map((player) => {
            return (
              <div key={`winner-${player.musicianId}`}>
                {player.playerAlias} with {winResult.numPoints} votes
              </div>
            );
          })}
        </div>
      ) : endOfGame ? (
        <div>
          <MediumTitle title="Game Winner" />
          <div>{`${winners[0].playerAlias} wins game with ${winResult.numPoints} total votes`}</div>
        </div>
      ) : (
        <div>
          <MediumTitle title="Round Winner" />
          <div>{`${winners[0].playerAlias} wins round ${roundNum} with ${winResult.numPoints} votes`}</div>
        </div>
      )}
    </div>
  );
};
export { WinResultText };
