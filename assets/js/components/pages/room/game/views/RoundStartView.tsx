import React from "react";
import {
  Timer,
  TimerBox,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import { useGameContext } from "../../../../../hooks";
import { calcMsUntilMsTimestamp } from "../../../../../utils";

interface RoundStartViewProps {
  pushMessageToChannel: Function;
  roundNum: number;
}

const desc = `
You will be playing this round. A sample to play over has been picked.
`;

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
  roundNum,
}) => {
  const {
    gameRules: {
      viewTimeouts: { roundStart: roundStartTimeout },
    },
    viewDeadline,
  } = useGameContext();
  return (
    <div>
      <MediumLargeTitle title={`STARTING ROUND ${roundNum}`} />

      <DynamicContent>
        <Instructions description={desc} />
      </DynamicContent>
      <TimerBox>
        <Timer
          descriptionText={"Play starting in "}
          duration={calcMsUntilMsTimestamp(viewDeadline)}
        />
      </TimerBox>
    </div>
  );
};
export { RoundStartView };
