import React, { useState, useMemo } from "react";

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
} from "../../../common";
import { useLoadRandomSamples } from "../../../../hooks";

interface PracticeSampleSelectionViewProps {
  samples: string[];
  loadSample: Function;
  setCurrentSample: Function;
  advanceView: Function;
  currentSample?: string;
}

const PracticeSampleSelectionView: React.FC<PracticeSampleSelectionViewProps> = ({
  samples,
  loadSample,
  setCurrentSample,
  currentSample,
  advanceView,
}) => {
  return (
    <div>
      <DynamicContent>
        {!!currentSample ? (
          <div>
            <MediumTitle>{currentSample}</MediumTitle>
          </div>
        ) : (
          <></>
        )}
        <ComputerButton
          callback={() => {
            const newSample =
              samples[Math.floor(Math.random() * samples.length)];
            loadSample(newSample);
            setCurrentSample(newSample);
          }}
        >
          <h5>NEW SAMPLE</h5>
        </ComputerButton>
        <ComputerButton callback={() => advanceView()}>
          <h5>CONTINUE</h5>
        </ComputerButton>
      </DynamicContent>
    </div>
  );
};
export { PracticeSampleSelectionView };
