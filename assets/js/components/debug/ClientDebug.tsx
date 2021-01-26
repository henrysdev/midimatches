import React from "react";

import { useGameContext, useToneAudioContext } from "../../hooks";
import { DebugButton } from "./";
import { useSamplePlayer } from "../../hooks";

interface ClientDebugProps {
  musicianId: string;
}

const ClientDebug: React.FC<ClientDebugProps> = ({ musicianId }) => {
  const gameContext = useGameContext();
  const { Tone } = useToneAudioContext();
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);

  return (
    <div>
      <div>Musician: {musicianId}</div>

      {/* <DebugButton
        label="Load Sample"
        callback={() => loadSample("/sounds/ragga_sample.mp3")}
      />
      <DebugButton label="Start Playback" callback={() => playSample()} />
      <DebugButton label="Stop Playback" callback={() => stopSample()} /> */}

      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
    </div>
  );
};
export { ClientDebug };
