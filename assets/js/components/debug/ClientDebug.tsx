import React, { useContext } from "react";

import { DEFAULT_SYNTH_CONFIG } from "../../constants";
import { GameContext } from "../../contexts";
import { DebugButton } from "./";
import { useSamplePlayer } from "../../hooks";

interface ClientDebugProps {
  musicianId: string;
}

const ClientDebug: React.FC<ClientDebugProps> = ({ musicianId }) => {
  const gameContext = useContext(GameContext);
  const [loadSample, playSample, stopSample] = useSamplePlayer();

  return (
    <div>
      <div>Musician: {musicianId}</div>

      <DebugButton
        label="Load Sample"
        callback={() => loadSample("/sounds/ragga_sample.mp3")}
      />
      <DebugButton label="Start Playback" callback={() => playSample()} />
      <DebugButton label="Stop Playback" callback={() => stopSample()} />

      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
    </div>
  );
};
export { ClientDebug };
