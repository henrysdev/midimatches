import React, { useState } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
} from "../../../../../constants";
import { RecordMidi } from "../../../../audio";
import { Timer, Instructions, Title, DynamicContent } from "../../../../common";
import { secToMs } from "../../../../../utils";

interface RecordingViewProps {
  isContestant: boolean;
  pushMessageToChannel: Function;
  playSample: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  isContestant,
  pushMessageToChannel,
  playSample,
}) => {
  const submitRecording = (recording: any) => {
    if (!!recording) {
      pushMessageToChannel(SUBMIT_RECORDING_EVENT, {
        recording: JSON.stringify(recording),
      });
    }
  };

  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const playSampleWithEffect = () => {
    setIsSamplePlaying(true);
    playSample();
  };

  return isContestant ? (
    <div>
      <Title title="Time to Play!" />
      <DynamicContent>
        <div style={{ height: "20px" }}>
          {isRecording ? (
            <Timer
              key={`record-timer-${isRecording}`}
              descriptionText={"Recording ends in "}
              duration={secToMs(DEFAULT_RECORDING_LENGTH)}
            />
          ) : (
            <></>
          )}
          {isSamplePlaying && !isRecording ? (
            <Timer
              key={`sample-timer-${isSamplePlaying}`}
              descriptionText={"Recording starts in "}
              duration={secToMs(DEFAULT_SAMPLE_LENGTH)}
            />
          ) : (
            <></>
          )}
        </div>

        <RecordMidi
          submitRecording={submitRecording}
          playSample={playSampleWithEffect}
          setIsRecording={setIsRecording}
        />
      </DynamicContent>
      <Instructions
        description={`warm up on the sample before recording begins`}
      />
    </div>
  ) : (
    <div>WAITING FOR CONTESTANTS TO FINISH RECORDING...</div>
  );
};
export { RecordingView };
