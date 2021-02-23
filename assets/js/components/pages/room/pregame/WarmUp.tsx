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
      playSample={() => {}}
      stopSample={() => {}}
      setIsRecording={() => {}}
      gameRules={{} as GameRules}
      roundRecordingStartTime={0}
      shouldRecord={true}
    />
  ) : (
    <></>
  );
};
export { WarmUp };
