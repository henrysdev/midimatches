import React, { useState, useMemo } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
  DEFAULT_WARMUP_LENGTH,
} from "../../../../../constants";
import { RecordMidi } from "../../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
  TimerBox,
  MaterialIcon,
} from "../../../../common";
import { secToMs, calcMsUntilMsTimestamp } from "../../../../../utils";
import {
  useGameRulesContext,
  useViewDeadlineContext,
  useRoundRecordingStartTimeContext,
} from "../../../../../hooks";

enum RecordingState {
  INIT,
  WARMUP,
  RECORDING,
  DONE,
}

interface RecordingViewProps {
  isContestant: boolean;
  pushMessageToChannel: Function;
  stopSample: Function;
  sampleName: string;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  isContestant,
  pushMessageToChannel,
  stopSample,
  sampleName,
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

  const sampleStartPlayCallbackWrapper = () => {
    setIsSamplePlaying(true);
  };

  const { gameRules } = useGameRulesContext();
  const { viewDeadline } = useViewDeadlineContext();
  const { roundRecordingStartTime } = useRoundRecordingStartTimeContext();

  const recordingState: RecordingState = useMemo(() => {
    if (isSamplePlaying && !isRecording && !isFinishedRecording) {
      return RecordingState.WARMUP;
    } else if (isSamplePlaying && isRecording && !isFinishedRecording) {
      return RecordingState.RECORDING;
    } else if (isFinishedRecording) {
      return RecordingState.DONE;
    } else {
      return RecordingState.INIT;
    }
  }, [isSamplePlaying, isRecording, isFinishedRecording]);

  return (
    <div
      className={isRecording ? "view_container neon_border" : "view_container "}
    >
      <MediumLargeTitle title="PLAY AND RECORD" />
      {isContestant ? (
        <div style={{ height: "100%" }}>
          <DynamicContent>
            <p className="centered_text">
              <strong className="large_instructions_text">{`Sample: ${sampleName}`}</strong>
            </p>

            {!!roundRecordingStartTime ? (
              <RecordMidi
                hideKeyboard={recordingState === RecordingState.INIT}
                submitRecording={submitRecording}
                sampleStartPlayCallback={sampleStartPlayCallbackWrapper}
                stopSample={stopSample}
                setIsRecording={setIsRecording}
                gameRules={gameRules}
                roundRecordingStartTime={roundRecordingStartTime}
                shouldRecord={true}
                isRecording={isRecording}
              />
            ) : (
              <></>
            )}

            {recordingState === RecordingState.INIT ? (
              <Instructions description="Loading sample and syncing clients..." />
            ) : recordingState === RecordingState.WARMUP ? (
              <Instructions description="Listen to the sample and get ready to record!" />
            ) : recordingState === RecordingState.RECORDING ? (
              <Instructions
                description="Recording in progress... keep playing!"
                extreme={true}
              />
            ) : (
              <Instructions
                description="Recording submitted. Waiting for other players to finish
            recording..."
              />
            )}
          </DynamicContent>
          <TimerBox>
            {recordingState === RecordingState.INIT ? (
              <></>
            ) : recordingState === RecordingState.WARMUP ? (
              <Timer
                descriptionText={"Recording starts in "}
                duration={secToMs(DEFAULT_WARMUP_LENGTH)}
                extremeText={true}
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
                  <MaterialIcon
                    iconName="radio_button_checked"
                    style={{ color: "red" }}
                  />
                  <Timer
                    descriptionText={"Recording ends in "}
                    duration={secToMs(DEFAULT_RECORDING_LENGTH)}
                    style={{ color: "red" }}
                    extremeText={true}
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
          <DynamicContent>
            <Instructions
              description="Recording for this round has already begun. You will be able to record
          next round. Waiting for other players to finish recording..."
            />
          </DynamicContent>
          <TimerBox>
            <Timer
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
