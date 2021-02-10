import React from "react";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
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
      <MediumLargeTitle title="Starting Round " />
      <Instructions description={desc} />
      <DynamicContent>
        <Timer
          descriptionText={"Faceoff starting in "}
          duration={roundStartTimeout}
        />
      </DynamicContent>
    </div>
  );
};
export { RoundStartView };
