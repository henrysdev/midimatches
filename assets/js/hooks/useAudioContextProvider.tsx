import { useEffect, useState } from "react";

import * as Tone from "tone";
import { Input } from "webmidi";

import { DEFAULT_FM_SYNTH_CONFIG } from "../constants";
import { useSamplePlayer, useWebMidi } from ".";

import { ToneAudioContextType } from "../types";

export function useAudioContextProvider(): ToneAudioContextType {
  // midi inputs init
  const [originalMidiInputs] = useWebMidi();
  const [midiInputs, setMidiInputs] = useState<Array<Input>>([]);
  const [disabledMidiInputIds, setDisabledMidiInputIds] = useState<
    Array<string>
  >([]);
  useEffect(() => {
    if (!!originalMidiInputs) {
      setMidiInputs(
        originalMidiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    }
  }, [originalMidiInputs]);

  // synth + Tone init
  const [synth, setSynth] = useState<any>();
  useEffect(() => {
    Tone.context.lookAhead = 0;
    Tone.Master.volume.value = -0.5;

    const autoWah = new Tone.AutoWah(60, 6, -30).toDestination();
    const chorus = new Tone.Chorus(3, 0.5, 0.5).start();
    const vibrato = new Tone.Vibrato("16n", 0.05);
    const newSynth = new Tone.PolySynth(Tone.FMSynth, DEFAULT_FM_SYNTH_CONFIG);
    newSynth.chain(vibrato, chorus, Tone.Destination);

    setSynth(newSynth);
  }, []);

  // sample player
  const [
    isSamplePlayerLoaded,
    samplePlayer,
    loadSample,
    stopSample,
  ] = useSamplePlayer(Tone);
  const resetTone = () => {
    stopSample();
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
  };

  return {
    Tone,
    midiInputs,
    setMidiInputs,
    disabledMidiInputIds,
    setDisabledMidiInputIds,
    originalMidiInputs,
    synth,
    samplePlayer,
    loadSample,
    stopSample,
    resetTone,
    isSamplePlayerLoaded,
  };
}
