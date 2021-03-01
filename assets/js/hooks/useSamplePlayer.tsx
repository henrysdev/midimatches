import { useState, useEffect, useMemo } from "react";
import {
  S3_BUCKET_URL,
  DEFAULT_SAMPLE_VOLUME,
  DEFAULT_SAMPLE_LENGTH,
} from "../constants";

type SamplePlayerTuple = [boolean, any, (url: string) => void, () => void];

export function useSamplePlayer(Tone: any): SamplePlayerTuple {
  const [loadedSampleName, setLoadedSampleName] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const samplePlayer = useMemo(() => {
    const newSamplePlayer = new Tone.Player({
      loop: true,
      loopStart: 0,
      loopEnd: DEFAULT_SAMPLE_LENGTH,
    }).toDestination();
    newSamplePlayer.volume.value = DEFAULT_SAMPLE_VOLUME;
    return newSamplePlayer;
  }, []);

  const loadSample = async (sampleBeatFilename: string) => {
    if (!!samplePlayer && sampleBeatFilename !== loadedSampleName) {
      setIsLoaded(false);
      await samplePlayer.load(
        `${S3_BUCKET_URL}/sample-beats/${sampleBeatFilename}`
      );
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
