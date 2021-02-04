import React, { useEffect, useState } from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { WinResult } from "../../../../../types";

interface RoundEndViewProps {}

const RoundEndView: React.FC<RoundEndViewProps> = () => {
  const {
    roundWinners,
    gameRules: {
      viewTimeouts: { roundEnd: roundEndTimeout },
    },
  } = useGameContext();

  return (
    <div>
      <div>
        <Title title="End of Round" />
        <div>
          {!!roundWinners ? (
            roundWinners.winners.length > 1 ? (
              <div>
                <div>Round Tie</div>
                {roundWinners.winners.map((winnerId) => {
                  return (
                    <div key={`winner-${winnerId}`}>
                      {winnerId} with {roundWinners.numPoints} votes
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div>Round Winner</div>
                <div>{`${roundWinners.winners[0]} wins round with ${roundWinners.numPoints} total votes`}</div>
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
