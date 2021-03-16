import React from "react";
import {
  Timer,
  TimerBox,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import {
  useViewDeadlineContext,
  useClockOffsetContext,
} from "../../../../../hooks";
import { calcMsUntilMsTimestamp, currUtcTimestamp } from "../../../../../utils";

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
  const { viewDeadline } = useViewDeadlineContext();
  const { clockOffset } = useClockOffsetContext();
  return (
    <div className="view_container">
      <MediumLargeTitle title={`STARTING ROUND ${roundNum}`} />

      <DynamicContent>
        <Instructions description={desc} />
      </DynamicContent>
      <TimerBox>
        <Timer
          descriptionText={"Play starting in "}
          duration={calcMsUntilMsTimestamp(viewDeadline) + clockOffset}
        />
      </TimerBox>
    </div>
  );
};
export { RoundStartView };
