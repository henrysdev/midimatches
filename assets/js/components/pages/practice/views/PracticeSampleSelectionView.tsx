import React, { useState, useMemo, useEffect } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
  DEFAULT_WARMUP_LENGTH,
} from "../../../../constants";
import { RecordMidi } from "../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  MediumTitle,
  DynamicContent,
  TimerBox,
  ComputerButton,
  InlineWidthButton,
} from "../../../common";
import { randomElement } from "../../../../utils";
import { useToneAudioContext } from "../../../../hooks";

interface PracticeSampleSelectionViewProps {
  samples: string[];
  loadSample: Function;
  pickNewSample: Function;
  stopSample: Function;
  samplePlayer: any;
  advanceView: Function;
  currentSample?: string;
}

const PracticeSampleSelectionView: React.FC<PracticeSampleSelectionViewProps> = ({
  samples,
  loadSample,
  stopSample,
  samplePlayer,
  pickNewSample,
  currentSample,
  advanceView,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stopSamplePreview = () => {
    stopSample();
    setIsPlaying(false);
  };

  const startSamplePreview = () => {
    samplePlayer.start();
    setIsPlaying(true);
  };

  const togglePlaySample = () => {
    if (isPlaying) {
      stopSamplePreview();
    } else {
      startSamplePreview();
    }
  };

  return (
    <div className="view_container">
      <MediumLargeTitle>PRACTICE - SAMPLE SELECTION</MediumLargeTitle>
      <DynamicContent>
        {!!currentSample ? (
          <div className="selected_sample_anchor">
            <MediumTitle>{currentSample}</MediumTitle>

            <div
              className="selected_sample_play_button relative_anchor"
              onClick={togglePlaySample}
            >
              <div className="selected_sample_play_button_icon">
                {isPlaying ? (
                  <i
                    style={{
                      verticalAlign: "middle",
                      textAlign: "center",
                      fontSize: "50px",
                    }}
                    className="material-icons"
                  >
                    stop_circle
                  </i>
                ) : (
                  <i
                    style={{
                      verticalAlign: "middle",
                      textAlign: "center",
                      fontSize: "50px",
                    }}
                    className="material-icons"
                  >
                    play_circle
                  </i>
                )}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <InlineWidthButton
          callback={() => {
            stopSamplePreview();
            pickNewSample(samples, currentSample);
          }}
        >
          <h5>
            NEW SAMPLE
            <i style={{ verticalAlign: "middle" }} className="material-icons">
              loop
            </i>
          </h5>
        </InlineWidthButton>
        <InlineWidthButton
          callback={() => {
            stopSamplePreview();
            advanceView();
          }}
        >
          <h5>CONTINUE</h5>
        </InlineWidthButton>
      </DynamicContent>
    </div>
  );
};
export { PracticeSampleSelectionView };
