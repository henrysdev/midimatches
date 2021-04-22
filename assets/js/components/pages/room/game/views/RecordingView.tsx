import React, { useState, useMemo } from "react";

import { SUBMIT_RECORDING_EVENT } from "../../../../../constants";
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
  useBackingTrackContext,
} from "../../../../../hooks";
import { BackingTrack } from "../../../../../types";

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
}

const RecordingView: React.FC<RecordingViewProps> = ({
  isContestant,
  pushMessageToChannel,
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

  const sampleStartPlayCallbackWrapper = () => {
    setIsSamplePlaying(true);
  };

  const { gameRules } = useGameRulesContext();
  const { viewDeadline } = useViewDeadlineContext();
  const { roundRecordingStartTime } = useRoundRecordingStartTimeContext();
  const { backingTrack, warmUpTime, recordingTime } = useBackingTrackContext();

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
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, minWidth: 100 }}></div>

              <div style={{ width: 200 }}>
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>
                    <p
                      className="centered_text"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <strong className="large_instructions_text">
                        {backingTrack.name}
                      </strong>
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ whiteSpace: "nowrap" }}>
                      <i className="large_instructions_text">
                        {`(${backingTrack.musicalKey})`}
                      </i>
                    </p>
                  </div>
                  {isSamplePlaying ? (
                    <div style={{ flex: 1 }}>
                      <div className="sound_wave_bars">
                        {[...Array(5).keys()].map((i) => {
                          return <div key={i} className="sound_wave_bar" />;
                        })}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 100 }}></div>
            </div>

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
                setIsSamplePlaying={setIsSamplePlaying}
              />
            ) : (
              <></>
            )}

            {recordingState === RecordingState.INIT ? (
              <Instructions description="Loading sample and syncing clients..." />
            ) : recordingState === RecordingState.WARMUP ? (
              <Instructions description="Listen to the sample and warm up your fingers!" />
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
                duration={secToMs(warmUpTime)}
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
                    duration={secToMs(recordingTime)}
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
