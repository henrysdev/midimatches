import { useState, useEffect } from "react";
import { S3_BUCKET_URL, DEFAULT_SAMPLE_VOLUME } from "../constants";

type SamplePlayerTuple = [(url: string) => void, () => void, () => void];

export function useSamplePlayer(Tone: any): SamplePlayerTuple {
  const [samplePlayer, setSamplePlayer] = useState() as any;
  const [loadedSampleName, setLoadedSampleName] = useState<string>();

  useEffect(() => {
    const newSamplePlayer = new Tone.Player().toDestination();
    newSamplePlayer.volume.value = DEFAULT_SAMPLE_VOLUME;
    setSamplePlayer(newSamplePlayer);
  }, []);

  const loadSample = (sampleBeatFilename: string) => {
    if (!!samplePlayer && sampleBeatFilename !== loadedSampleName) {
      samplePlayer.load(`${S3_BUCKET_URL}/sample-beats/${sampleBeatFilename}`);
      setLoadedSampleName(sampleBeatFilename);
    }
  };

  const playSample = () => {
    if (!!samplePlayer) {
      samplePlayer.start();
    }
  };

  const stopSample = () => {
    if (!!samplePlayer) {
      Tone.Transport.cancel(0);
      samplePlayer.stop();
    }
  };

  return [loadSample, playSample, stopSample];
}
