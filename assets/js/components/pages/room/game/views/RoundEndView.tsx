import React, { useEffect, useState } from "react";
import {
  Timer,
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
        winnerIdsSet.has(player.musicianId)
      );
      setWinningPlayers(newWinningPlayers);
    }
  }, [roundWinners]);

  return (
    <div>
      <div>
        <MediumLargeTitle title={`End of Round ${roundNum}`} />

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
