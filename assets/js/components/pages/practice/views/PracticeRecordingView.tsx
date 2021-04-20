import React, { useState, useMemo } from "react";

import { RecordMidi } from "../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  MediumTitle,
  DynamicContent,
  TimerBox,
  MaterialIcon,
} from "../../../common";
import { secToMs, unmarshalBody } from "../../../../utils";
import {
  useGameContext,
  useBackingTrackContext,
  useBackingTrackContextProvider,
} from "../../../../hooks";
import { BackingTrack } from "../../../../types";
import { BackingTrackContext } from "../../../../contexts";

enum RecordingState {
  INIT,
  WARMUP,
  RECORDING,
  DONE,
}

interface PracticeRecordingViewProps {
  setRecordingCallback: Function;
  stopSample: Function;
  advanceView: Function;
  backingTrack: BackingTrack;
}

const PracticeRecordingView: React.FC<PracticeRecordingViewProps> = ({
  setRecordingCallback,
  stopSample,
  advanceView,
  backingTrack,
}) => {
  const backingTrackContext = useBackingTrackContext();
  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinishedRecording, setFinishedRecording] = useState<boolean>(false);

  const submitRecording = (recording: any) => {
    if (!!recording) {
      setRecordingCallback(unmarshalBody(recording));
      setFinishedRecording(true);
      advanceView();
    }
  };

  const sampleStartPlayCallbackWrapper = () => {
    setIsSamplePlaying(true);
  };

  const { gameRules, roundRecordingStartTime } = useGameContext();

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
      <span className="anim_line" />
      <span className="anim_line" />
      <span className="anim_line" />
      <span className="anim_line" />
      <MediumLargeTitle>PRACTICE - RECORDING</MediumLargeTitle>
      <DynamicContent>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1, minWidth: 100 }}></div>

          <div style={{ width: 200 }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1 }}>
                <p className="centered_text">
                  <strong className="large_instructions_text">
                    {backingTrack.name}
                  </strong>
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
          <Instructions description="Loading sample..." />
        ) : recordingState === RecordingState.WARMUP ? (
          <Instructions description="Listen to the sample and warm up your fingers!" />
        ) : recordingState === RecordingState.RECORDING ? (
          <Instructions description="Recording in progress... keep playing!" />
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
            duration={secToMs(backingTrackContext.warmUpTime)}
          />
        ) : recordingState === RecordingState.RECORDING ? (
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
              duration={secToMs(backingTrackContext.recordingTime)}
              style={{ color: "red" }}
            />
          </div>
        ) : (
          <></>
        )}
      </TimerBox>
    </div>
  );
};
export { PracticeRecordingView };
