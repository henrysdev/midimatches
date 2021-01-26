import React, { useEffect, useState } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
} from "../../../../../constants";
import { RecordMidi } from "../../../../audio";
import { Timer } from "../../../../common";
import { secToMs } from "../../../../../utils";
import { useGameContext } from "../../../../../hooks";

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
      <h3>Recording View</h3>
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

      <RecordMidi
        submitRecording={submitRecording}
        playSample={playSampleWithEffect}
        setIsRecording={setIsRecording}
      />
    </div>
  ) : (
    <div>WAITING FOR CONTESTANTS TO FINISH RECORDING...</div>
  );
};
export { RecordingView };
