import React from "react";
import { Timer, Instructions } from "../../../../common";
import { useGameContext } from "../../../../../hooks";

interface RoundStartViewProps {
  pushMessageToChannel: Function;
}

const desc = `
You will be playing this round. A sample to play over has been picked.
`;

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
}) => {
  const {
    gameRules: {
      viewTimeouts: { roundStart: roundStartTimeout },
    },
  } = useGameContext();
  return (
    <div>
      <Instructions title="Round Start" description={desc}>
        <Timer
          descriptionText={"Faceoff starting in "}
          duration={roundStartTimeout}
        />
      </Instructions>
    </div>
  );
};
export { RoundStartView };
