import { useState, useEffect, useMemo } from "react";
import { DEFAULT_SAMPLE_VOLUME } from "../constants";

type SamplePlayerTuple = [boolean, any, (url: string) => void, () => void];

export function useSamplePlayer(Tone: any, recorder: any): SamplePlayerTuple {
  const [loadedSampleName, setLoadedSampleName] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

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
      setIsLoaded(false);
      await samplePlayer.load(sampleBeatFilename);
      setLoadedSampleName(sampleBeatFilename);
      setIsLoaded(true);
    }
  };

  const stopSample = () => {
    if (!!samplePlayer && samplePlayer.state === "started") {
      Tone.Transport.cancel(0);
      samplePlayer.stop();
    }
  };

  return [isLoaded, samplePlayer, loadSample, stopSample];
}
