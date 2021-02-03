import React from "react";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
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
      <Title title="Starting Round " />
      <DynamicContent>
        <Timer
          descriptionText={"Faceoff starting in "}
          duration={roundStartTimeout}
        />
      </DynamicContent>
      <Instructions description={desc} />
    </div>
  );
};
export { RoundStartView };
