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
  stopSample: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  isContestant,
  pushMessageToChannel,
  playSample,
  stopSample,
}) => {
  const submitRecording = (recording: any) => {
    if (!!recording) {
      pushMessageToChannel(SUBMIT_RECORDING_EVENT, {
        recording: JSON.stringify(recording),
      });
    }
  };

  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const playSampleWithEffect = () => {
    setIsSamplePlaying(true);
    playSample();
  };

  return isContestant ? (
    <div>
      <Title title="Time to Play!" />
      <Instructions
        description={`Listen to the sample and warm up before recording begins.`}
      />
      <DynamicContent style={isRecording ? { backgroundColor: "#ffd9db" } : {}}>
        <div style={{ height: "20px" }}>
          {isRecording ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <i
                style={{ verticalAlign: "middle", color: "red" }}
                className="material-icons"
              >
                radio_button_checked
              </i>
              <Timer
                key={`record-timer-${isRecording}`}
                descriptionText={"Recording ends in "}
                duration={secToMs(DEFAULT_RECORDING_LENGTH)}
                style={{ color: "red" }}
              />
            </div>
          ) : (
            <></>
          )}
          {isSamplePlaying && !isRecording ? (
            <Timer
              key={`sample-timer-${isSamplePlaying}`}
              descriptionText={"Warm up! Recording starts in "}
              duration={secToMs(DEFAULT_SAMPLE_LENGTH)}
            />
          ) : (
            <></>
          )}
        </div>

        <RecordMidi
          submitRecording={submitRecording}
          playSample={playSampleWithEffect}
          stopSample={stopSample}
          setIsRecording={setIsRecording}
        />
      </DynamicContent>
    </div>
  ) : (
    <div>WAITING FOR CONTESTANTS TO FINISH RECORDING...</div>
  );
};
export { RecordingView };
