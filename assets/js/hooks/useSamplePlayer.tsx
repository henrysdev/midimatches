import { useState, useEffect, useMemo } from "react";
import { useAudioBufferCache } from "./useAudioBufferCache";
import { DEFAULT_SAMPLE_VOLUME } from "../constants";
import { ToneAudioBuffer } from "tone";

type SamplePlayerTuple = [
  boolean,
  any,
  (url: string) => void,
  () => void,
  (urls: string[]) => void
];

export function useSamplePlayer(Tone: any, recorder: any): SamplePlayerTuple {
  const [loadedSampleName, setLoadedSampleName] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [audioBufferCache, populateBufferCache] = useAudioBufferCache();

  const samplePlayer = useMemo(() => {
    const newSamplePlayer = new Tone.Player({
      loop: true,
      loopStart: 0,
    }).toDestination();
    newSamplePlayer.volume.value = DEFAULT_SAMPLE_VOLUME;
    newSamplePlayer.connect(recorder);
    return newSamplePlayer;
  }, []);

  const loadSample = async (sampleBeatFilename: string) => {
    if (!!samplePlayer && sampleBeatFilename !== loadedSampleName) {
      const audioBuffer = audioBufferCache.get(sampleBeatFilename);

      if (!!audioBuffer) {
        samplePlayer.set({
          buffer: audioBuffer,
        });
      } else {
        setIsLoaded(false);
        await samplePlayer.load(sampleBeatFilename);
      }
      setIsLoaded(true);
      setLoadedSampleName(sampleBeatFilename);
    }
  };

  const batchLoadSamples = async (sampleUrls: string[]) => {
    await populateBufferCache(sampleUrls);
  };

  const stopSample = () => {
    if (!!samplePlayer && samplePlayer.state === "started") {
      Tone.Transport.cancel(0);
      samplePlayer.stop();
    }
  };

  return [isLoaded, samplePlayer, loadSample, stopSample, batchLoadSamples];
}
