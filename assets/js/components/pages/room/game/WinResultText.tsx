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
      : [{ playerAlias: "missing player", playerId: "-1" }];
  }, [roundNum]);

  return (
    <div style={{ textAlign: "center" }}>
      {winners.length > 1 ? (
        <div>
          {endOfGame ? (
            <MediumTitle title="GAME TIE" />
          ) : (
            <MediumTitle title="ROUND TIE" />
          )}

          {winners.map((player) => {
            return (
              <p key={`winner-${player.playerId}`}>
                {player.playerAlias} with {winResult.numPoints} votes
              </p>
            );
          })}
        </div>
      ) : endOfGame ? (
        <div>
          <MediumTitle title="GAME WINNER" />
          <p>{`${winners[0].playerAlias} wins game with ${winResult.numPoints} total votes`}</p>
        </div>
      ) : (
        <div>
          <MediumTitle title="ROUND WINNER" />
          <p>{`${winners[0].playerAlias} wins round ${roundNum} with ${winResult.numPoints} votes`}</p>
        </div>
      )}
    </div>
  );
};
export { WinResultText };
