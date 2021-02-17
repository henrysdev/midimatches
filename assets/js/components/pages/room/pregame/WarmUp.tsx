import React, { useEffect, useState } from "react";

import { DEFAULT_SYNTH_CONFIG } from "../../../../constants";
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
    Tone.context.lookAhead = 0;
    const newSynth = new Tone.PolySynth(DEFAULT_SYNTH_CONFIG).toDestination();
    // const newSynth = new Tone.Sampler({
    //   urls: {
    //     C4: "funk_daddy_c4.mp3",
    //     C5: "funk_daddy_c5.mp3",
    //   },
    //   baseUrl: "https://progressions-game.s3.amazonaws.com/synths/funk_daddy/",
    // }).toDestination();
    setSynth(newSynth);
  }, []);

  return !!synth ? (
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
