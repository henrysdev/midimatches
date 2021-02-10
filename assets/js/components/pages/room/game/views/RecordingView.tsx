import React, { useState } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
} from "../../../../../constants";
import { RecordMidi } from "../../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
} from "../../../../common";
import { secToMs } from "../../../../../utils";
import { useGameContext } from "../../../../../hooks";

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

  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const playSampleWithEffect = () => {
    setIsSamplePlaying(true);
    playSample();
  };

  const { gameRules, roundRecordingStartTime } = useGameContext();

  return isContestant ? (
    <div>
      <MediumLargeTitle title="Time to Play!" />
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
        {!!roundRecordingStartTime ? (
          <RecordMidi
            submitRecording={submitRecording}
            playSample={playSampleWithEffect}
            stopSample={stopSample}
            setIsRecording={setIsRecording}
            gameRules={gameRules}
            roundRecordingStartTime={roundRecordingStartTime}
            shouldRecord={true}
          />
        ) : (
          <></>
        )}
      </DynamicContent>
    </div>
  ) : (
    <div>Waiting for other players to finish recording...</div>
  );
};
export { RecordingView };
