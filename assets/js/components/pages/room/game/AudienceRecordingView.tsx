import React, { useState, useMemo } from "react";

import { RecordMidi } from "../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
  TimerBox,
  MaterialIcon,
} from "../../../common";
import { secToMs, calcMsUntilMsTimestamp } from "../../../../utils";
import {
  useGameRulesContext,
  useViewDeadlineContext,
  useRoundRecordingStartTimeContext,
} from "../../../../hooks";

const desc =
  `Players are recording now. You will be able to listen to and ` +
  `vote on these recordings once all Player submissions have been received.`;

interface AudienceRecordingViewProps {}

const AudienceRecordingView: React.FC<AudienceRecordingViewProps> = ({}) => {
  const { viewDeadline } = useViewDeadlineContext();

  return (
    <div className="view_container ">
      <MediumLargeTitle title="PLAYERS ARE RECORDING..." />
      <div style={{ height: "100%" }}>
        <DynamicContent>
          <Instructions description={desc} />
        </DynamicContent>
        <TimerBox>
          <Timer
            descriptionText={"Recording ends in "}
            duration={calcMsUntilMsTimestamp(viewDeadline)}
          />
        </TimerBox>
      </div>
    </div>
  );
};
export { AudienceRecordingView };
