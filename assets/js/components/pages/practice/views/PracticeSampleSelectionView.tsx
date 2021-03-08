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
  InlineWidthButton,
} from "../../../common";
import { randomElement } from "../../../../utils";
import { useLoadRandomSamples } from "../../../../hooks";

interface PracticeSampleSelectionViewProps {
  samples: string[];
  loadSample: Function;
  pickNewSample: Function;
  advanceView: Function;
  currentSample?: string;
}

const PracticeSampleSelectionView: React.FC<PracticeSampleSelectionViewProps> = ({
  samples,
  loadSample,
  pickNewSample,
  currentSample,
  advanceView,
}) => {
  return (
    <div>
      <MediumLargeTitle>PRACTICE - SAMPLE SELECTION</MediumLargeTitle>
      <DynamicContent>
        {!!currentSample ? (
          <div>
            <MediumTitle>{currentSample}</MediumTitle>
          </div>
        ) : (
          <></>
        )}
        <InlineWidthButton
          callback={() => {
            pickNewSample(samples, currentSample);
          }}
        >
          <h5>NEW SAMPLE</h5>
        </InlineWidthButton>
        <InlineWidthButton callback={() => advanceView()}>
          <h5>CONTINUE</h5>
        </InlineWidthButton>
      </DynamicContent>
    </div>
  );
};
export { PracticeSampleSelectionView };
