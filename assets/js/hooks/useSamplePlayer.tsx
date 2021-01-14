import { useState, useEffect } from "react";

type SamplePlayerTuple = [(url: string) => void, () => void, () => void];

export function useSamplePlayer(tone: any): SamplePlayerTuple {
  const [samplePlayer, setSamplePlayer] = useState() as any;

  useEffect(() => {
    const newSamplePlayer = new tone.Player().toDestination();
    newSamplePlayer.volume.value = -6;
    setSamplePlayer(newSamplePlayer);
  }, []);

  const loadSample = (url: string) => {
    if (!!samplePlayer) {
      samplePlayer.load(url);
    }
  };

  const playSample = () => {
    if (!!samplePlayer) {
      samplePlayer.start();
    }
  };

  const stopSample = () => {
    if (!!samplePlayer) {
      samplePlayer.stop();
    }
  };

  return [loadSample, playSample, stopSample];
}
