import React, { useEffect, useState } from "react";

import { DEFAULT_SYNTH_CONFIG } from "../../../../constants";
import { FullWidthButton, Title } from "../../../common";
import { RecordMidi } from "../../../audio";
import { PregameDebug } from "../../../debug";
import { ToneAudioContext } from "../../../../contexts";
import { useWebMidi } from "../../../../hooks";
import { GameRules } from "../../../../types";
import * as Tone from "tone";

interface WarmUpProps {}

const WarmUp: React.FC<WarmUpProps> = ({}) => {
  const [midiInputs] = useWebMidi();
  const [synth, setSynth] = useState<any>();

  useEffect(() => {
    Tone.context.lookAhead = 0.01;
    const newSynth = new Tone.PolySynth(DEFAULT_SYNTH_CONFIG).toDestination();
    setSynth(newSynth);
  }, []);

  return midiInputs.length > 0 && !!synth ? (
    <ToneAudioContext.Provider value={{ Tone, midiInputs, synth }}>
      <RecordMidi
        submitRecording={() => {}}
        playSample={() => {}}
        stopSample={() => {}}
        setIsRecording={() => {}}
        gameRules={{} as GameRules}
        roundRecordingStartTime={0}
        shouldRecord={true}
      />
    </ToneAudioContext.Provider>
  ) : (
    <></>
  );
};
export { WarmUp };
