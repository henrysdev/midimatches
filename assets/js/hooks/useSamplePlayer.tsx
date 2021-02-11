import { useState, useEffect } from "react";
import { S3_BUCKET_URL } from "../constants";

type SamplePlayerTuple = [(url: string) => void, () => void, () => void];

export function useSamplePlayer(Tone: any): SamplePlayerTuple {
  const [samplePlayer, setSamplePlayer] = useState() as any;

  useEffect(() => {
    const newSamplePlayer = new Tone.Player().toDestination();
    newSamplePlayer.volume.value = -6;
    setSamplePlayer(newSamplePlayer);
  }, []);

  const loadSample = (sampleBeatFilename: string) => {
    if (!!samplePlayer) {
      samplePlayer.load(`${S3_BUCKET_URL}/sample-beats/${sampleBeatFilename}`);
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
