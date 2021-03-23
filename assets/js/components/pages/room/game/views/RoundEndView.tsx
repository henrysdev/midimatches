import React, { useEffect, useState } from "react";
import {
  Timer,
  TimerBox,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import { useGameContext, useClockOffsetContext } from "../../../../../hooks";
import { calcMsUntilMsTimestamp } from "../../../../../utils";
import { WinResult, Player } from "../../../../../types";
import { WinResultText } from "../";

interface RoundEndViewProps {}

const RoundEndView: React.FC<RoundEndViewProps> = () => {
  const {
    roundWinners,
    roundNum,
    gameRules: {
      viewTimeouts: { roundEnd: roundEndTimeout },
    },
    viewDeadline,
    players,
  } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

  const { clockOffset } = useClockOffsetContext();

  useEffect(() => {
    if (!!roundWinners && roundWinners.winners.length && !!players) {
      const winnerIdsSet = new Set(roundWinners.winners);
      const newWinningPlayers = players.filter((player) =>
        winnerIdsSet.has(player.playerId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [roundWinners]);

  return (
    <div className="view_container">
      <MediumLargeTitle title={`END OF ROUND ${roundNum}`} />
      <DynamicContent>
        {!!winningPlayers && !!roundWinners ? (
          <WinResultText
            winResult={roundWinners}
            winningPlayers={winningPlayers}
            roundNum={roundNum}
            endOfGame={false}
          />
        ) : (
          <></>
        )}
      </DynamicContent>
      <TimerBox>
        <Timer
          descriptionText={"Next round in "}
          duration={calcMsUntilMsTimestamp(viewDeadline) + clockOffset}
        />
      </TimerBox>
    </div>
  );
};
export { RoundEndView };
