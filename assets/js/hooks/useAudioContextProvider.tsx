import { useEffect, useState, useMemo } from "react";

import * as Tone from "tone";
import { Input } from "webmidi";

import {
  DEFAULT_FM_SYNTH_CONFIG,
  SOUND_VOLUME_COOKIE,
  MIN_SOUND_VOLUME,
  DEFAULT_SOUND_VOLUME,
  DISABLED_MIDI_INPUTS_COOKIE,
  DEFAULT_SAMPLER_SYNTH,
  DEFAULT_INPUT_LAG_COMPENSATION,
  INPUT_LAG_COMPENSATION_COOKIE,
  ENABLE_QUANTIZATION_COOKIE,
} from "../constants";
import { useSamplePlayer, useWebMidi, useCookies } from ".";

import { ToneAudioContextType } from "../types";
import { useRecorder } from "./useRecorder";

export function useAudioContextProvider(): ToneAudioContextType {
  const { hasCookie, getCookie, setCookie } = useCookies();
  const [currInputLagComp, _setCurrInputLagComp] = useState<number>(
    DEFAULT_INPUT_LAG_COMPENSATION
  );
  const setCurrInputLagComp = (lagComp: number) => {
    setCookie(INPUT_LAG_COMPENSATION_COOKIE, lagComp);
    _setCurrInputLagComp(lagComp);
  };

  // const [shouldQuantize, _setShouldQuantize] = useState<boolean>(false);
  // const setShouldQuantize = (shouldQntz: boolean) => {
  //   setCookie(ENABLE_QUANTIZATION_COOKIE, shouldQntz);
  //   _setShouldQuantize(shouldQntz);
  // };

  const [currVolume, setCurrVolume] = useState<number>(-1);

  useEffect(() => {
    if (hasCookie(SOUND_VOLUME_COOKIE)) {
      const savedVolume = parseFloat(getCookie(SOUND_VOLUME_COOKIE));
      setCurrVolume(savedVolume);
    }
    if (hasCookie(DISABLED_MIDI_INPUTS_COOKIE)) {
      const savedDisabledMidiInputs = getCookie(DISABLED_MIDI_INPUTS_COOKIE);
      setDisabledMidiInputIds(savedDisabledMidiInputs);
    }
    if (hasCookie(INPUT_LAG_COMPENSATION_COOKIE)) {
      const lagComp = getCookie(INPUT_LAG_COMPENSATION_COOKIE);
      setCurrInputLagComp(lagComp);
    }
    // if (hasCookie(ENABLE_QUANTIZATION_COOKIE)) {
    //   const shouldQntz = getCookie(ENABLE_QUANTIZATION_COOKIE) === "true";
    //   console.log({
    //     shouldQntz,
    //   });
    //   setShouldQuantize(shouldQntz);
    // }
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

  const { recorder, startRecorder, stopRecorder } = useRecorder(Tone);

  // midi inputs init
  const [originalMidiInputs, refreshMidiInputs] = useWebMidi();
  const [midiInputs, setMidiInputs] = useState<Array<Input>>([]);
  const [disabledMidiInputIds, _setDisabledMidiInputIds] = useState<
    Array<string>
  >([]);
  const setDisabledMidiInputIds = (disabledIds: string[]) => {
    setCookie(DISABLED_MIDI_INPUTS_COOKIE, disabledIds);
    _setDisabledMidiInputIds(disabledIds);
  };
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

    const newSynth = new Tone.Sampler(DEFAULT_SAMPLER_SYNTH).toDestination();
    // const newSynth = new Tone.PolySynth(Tone.FMSynth, DEFAULT_FM_SYNTH_CONFIG);
    // const autoWah = new Tone.AutoWah(60, 6, -30).toDestination();
    // const chorus = new Tone.Chorus(3, 0.5, 0.5).start();
    // const vibrato = new Tone.Vibrato("16n", 0.05);
    // newSynth.chain(vibrato, chorus, Tone.Destination);

    newSynth.connect(recorder);
    setSynth(newSynth);
  }, []);

  // sample player
  const [
    isSamplePlayerLoaded,
    samplePlayer,
    loadSample,
    stopSample,
    batchLoadSamples,
  ] = useSamplePlayer(Tone, recorder);

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
    batchLoadSamples,
    stopSample,
    resetTone,
    isSamplePlayerLoaded,
    currVolume,
    setCurrVolume,
    soundIsOn,
    refreshMidiInputs,
    currInputLagComp,
    setCurrInputLagComp,
    recorder,
    startRecorder,
    stopRecorder,
    shouldQuantize: false,
    setShouldQuantize: () => {},
  };
}
