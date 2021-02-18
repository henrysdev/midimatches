import React, { useEffect, useState } from "react";
import {
  Timer,
  TimerBox,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import { useGameContext } from "../../../../../hooks";
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
    players,
  } = useGameContext();

  const [winningPlayers, setWinningPlayers] = useState<Player[]>();

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
    <div>
      <div>
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
            descriptionText={"Next round starting in "}
            duration={roundEndTimeout}
          />
        </TimerBox>
      </div>
    </div>
  );
};
export { RoundEndView };
