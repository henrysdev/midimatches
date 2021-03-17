import React from "react";

import { RecordMidi } from "../../../audio";
import { useToneAudioContext } from "../../../../hooks";
import { GameRules } from "../../../../types";

interface WarmUpProps {}

const WarmUp: React.FC<WarmUpProps> = ({}) => {
  const { synth } = useToneAudioContext();

  return !!synth ? (
    <RecordMidi
      submitRecording={() => {}}
      sampleStartPlayCallback={() => {}}
      stopSample={() => {}}
      setIsRecording={() => {}}
      gameRules={{} as GameRules}
      roundRecordingStartTime={0}
      shouldRecord={true}
      isRecording={false}
    />
  ) : (
    <></>
  );
};
export { WarmUp };
