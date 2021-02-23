import React, { useState, useMemo } from "react";

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
  TimerBox,
} from "../../../../common";
import { secToMs, calcMsUntilMsTimestamp } from "../../../../../utils";
import { useGameContext } from "../../../../../hooks";

enum RecordingState {
  INIT,
  SAMPLE,
  RECORDING,
  DONE,
}

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
  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinishedRecording, setFinishedRecording] = useState<boolean>(false);

  const submitRecording = (recording: any) => {
    if (!!recording) {
      pushMessageToChannel(SUBMIT_RECORDING_EVENT, {
        recording: JSON.stringify(recording),
      });
      setFinishedRecording(true);
    }
  };

  const playSampleWrapper = () => {
    setIsSamplePlaying(true);
    playSample();
  };

  const { gameRules, roundRecordingStartTime, viewDeadline } = useGameContext();

  const recordingState: RecordingState = useMemo(() => {
    if (isSamplePlaying && !isRecording && !isFinishedRecording) {
      return RecordingState.SAMPLE;
    } else if (isSamplePlaying && isRecording && !isFinishedRecording) {
      return RecordingState.RECORDING;
    } else if (isFinishedRecording) {
      return RecordingState.DONE;
    } else {
      return RecordingState.INIT;
    }
  }, [isSamplePlaying, isRecording, isFinishedRecording]);

  return (
    <div>
      <MediumLargeTitle title="PLAY AND RECORD" />
      {isContestant ? (
        <div>
          <DynamicContent
            style={isRecording ? { backgroundColor: "#ffd9db" } : {}}
          >
            {recordingState === RecordingState.INIT ? (
              <Instructions description="Loading sample and syncing clients..." />
            ) : recordingState === RecordingState.SAMPLE ? (
              <Instructions description="Get ready to record!" />
            ) : recordingState === RecordingState.RECORDING ? (
              <Instructions description="Recording in progress... keep playing!" />
            ) : (
              <Instructions
                description="Recording submitted. Waiting for other players to finish
            recording..."
              />
            )}

            {!!roundRecordingStartTime ? (
              <RecordMidi
                hideKeyboard={
                  recordingState === RecordingState.INIT ||
                  recordingState === RecordingState.DONE
                }
                submitRecording={submitRecording}
                playSample={playSampleWrapper}
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
          <TimerBox>
            {recordingState === RecordingState.INIT ? (
              <></>
            ) : recordingState === RecordingState.SAMPLE ? (
              <Timer
                key={`sample-timer-${isSamplePlaying}`}
                descriptionText={"Recording starts in "}
                duration={secToMs(DEFAULT_SAMPLE_LENGTH)}
              />
            ) : recordingState === RecordingState.RECORDING ? (
              <div>
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
              </div>
            ) : (
              <></>
            )}
          </TimerBox>
        </div>
      ) : (
        <div>
          <DynamicContent
            style={isRecording ? { backgroundColor: "#ffd9db" } : {}}
          >
            <Instructions
              description="Recording for this round has already begun. You will be able to record
          next round. Waiting for other players to finish recording..."
            />
          </DynamicContent>
          <TimerBox>
            <Timer
              key={`record-timer-${isRecording}`}
              descriptionText={"Recording ends in "}
              duration={calcMsUntilMsTimestamp(viewDeadline)}
            />
          </TimerBox>
        </div>
      )}
    </div>
  );
};
export { RecordingView };
