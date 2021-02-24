import { useState, useEffect, useMemo } from "react";
import { S3_BUCKET_URL, DEFAULT_SAMPLE_VOLUME } from "../constants";

type SamplePlayerTuple = [any, (url: string) => void, () => void];

export function useSamplePlayer(Tone: any): SamplePlayerTuple {
  const [loadedSampleName, setLoadedSampleName] = useState<string>();

  const samplePlayer = useMemo(() => {
    const newSamplePlayer = new Tone.Player().toDestination();
    newSamplePlayer.volume.value = DEFAULT_SAMPLE_VOLUME;
    return newSamplePlayer;
  }, []);

  const loadSample = (sampleBeatFilename: string) => {
    if (!!samplePlayer && sampleBeatFilename !== loadedSampleName) {
      samplePlayer.load(`${S3_BUCKET_URL}/sample-beats/${sampleBeatFilename}`);
      setLoadedSampleName(sampleBeatFilename);
    }
  };

  const stopSample = () => {
    if (!!samplePlayer) {
      Tone.Transport.cancel(0);
      samplePlayer.stop();
    }
  };

  return [samplePlayer, loadSample, stopSample];
}
