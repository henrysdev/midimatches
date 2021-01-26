import React, { useEffect, useState } from "react";
import { Timer } from "../../../../common";
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
      <h3>RoundEnd View</h3>
      {!!gameWinner ? (
        <div>{`${winner.winnerId} won with ${winner.numVotes} votes`}</div>
      ) : (
        <></>
      )}
      <Timer
        descriptionText={"Next round starting in "}
        duration={roundEndTimeout}
      />
    </div>
  );
};
export { RoundEndView };
