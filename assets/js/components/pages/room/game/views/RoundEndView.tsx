import React, { useEffect, useState } from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { useGameContext } from "../../../../../hooks";

interface RoundEndViewProps {}

const RoundEndView: React.FC<RoundEndViewProps> = () => {
  const {
    winner: gameWinner,
    gameRules: {
      viewTimeouts: { roundEnd: roundEndTimeout },
    },
  } = useGameContext();
  const [winner, setWinner] = useState({ winnerId: "", numVotes: 0 });

  useEffect(() => {
    if (!!gameWinner) {
      setWinner(gameWinner);
    }
  }, [gameWinner]);

  return (
    <div>
      {!!gameWinner ? (
        <div>
          <Title title="End of Round" />
          <DynamicContent>
            <Timer
              descriptionText={"Next round starting in "}
              duration={roundEndTimeout}
            />
          </DynamicContent>
          <Instructions
            description={`Round over. ${winner.winnerId} won with ${winner.numVotes} votes`}
          ></Instructions>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
export { RoundEndView };
