import { useState, useEffect } from "react";
import * as Tone from "tone";

type SamplePlayerTuple = [
  Tone.Player | undefined,
  (samplePlayer: Tone.Player) => void
];

export function useSamplePlayer(): SamplePlayerTuple {
  const [samplePlayer, setSamplePlayer] = useState<Tone.Player>();

  useEffect(() => {
    const _samplePlayer = new Tone.Player().toDestination();
    setSamplePlayer(_samplePlayer);
  }, []);

  return [samplePlayer, setSamplePlayer];
}
