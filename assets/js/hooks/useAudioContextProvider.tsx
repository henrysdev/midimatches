import { useEffect, useState, useMemo } from "react";

import * as Tone from "tone";
import { Input } from "webmidi";

import {
  DEFAULT_FM_SYNTH_CONFIG,
  SOUND_VOLUME_COOKIE,
  MIN_SOUND_VOLUME,
  DEFAULT_SOUND_VOLUME,
} from "../constants";
import { useSamplePlayer, useWebMidi, useCookies } from ".";

import { ToneAudioContextType } from "../types";

export function useAudioContextProvider(): ToneAudioContextType {
  const { hasCookie, getCookie, setCookie } = useCookies();
  const [currVolume, setCurrVolume] = useState<number>(-1);

  useEffect(() => {
    if (hasCookie(SOUND_VOLUME_COOKIE)) {
      const savedVolume = parseFloat(getCookie(SOUND_VOLUME_COOKIE));
      const startingVolume =
        savedVolume === MIN_SOUND_VOLUME ? DEFAULT_SOUND_VOLUME : savedVolume;
      setCurrVolume(startingVolume);
    }
  }, []);

  useEffect(() => {
    const volume = currVolume;
    Tone.Master.volume.value = volume;
    Tone.Master.mute = Math.floor(volume) === MIN_SOUND_VOLUME;
    setCookie(SOUND_VOLUME_COOKIE, currVolume);
  }, [currVolume]);

  const soundIsOn = useMemo(() => {
    return Math.floor(currVolume) === MIN_SOUND_VOLUME;
  }, [currVolume]);

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
    Tone.Master.volume.value = DEFAULT_SOUND_VOLUME;

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
    currVolume,
    setCurrVolume,
    soundIsOn,
  };
}
