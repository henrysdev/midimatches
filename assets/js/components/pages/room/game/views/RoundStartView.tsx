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
  sampleName: string;
}

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
  roundNum,
  sampleName,
}) => {
  const { viewDeadline } = useViewDeadlineContext();
  const { clockOffset } = useClockOffsetContext();
  return (
    <div className="view_container">
      <MediumLargeTitle title={`STARTING ROUND ${roundNum}`} />

      <DynamicContent>
        <Instructions description={`This round's sample: ${sampleName}`} />
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
