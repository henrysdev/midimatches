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
  const [samplePlayer, setSamplePlayer] = useSamplePlayer();

  const loadSample = () => {
    if (!!samplePlayer) {
      samplePlayer.load("/sounds/ragga_sample.mp3");
    }
  };

  const startPlayback = () => {
    if (!!samplePlayer) {
      samplePlayer.start();
    }
  };

  const stopPlayback = () => {
    if (!!samplePlayer) {
      samplePlayer.stop();
    }
  };

  return (
    <div>
      <div>Musician: {musicianId}</div>

      <DebugButton label="Load Sample" callback={() => loadSample()} />
      <DebugButton label="Start Playback" callback={() => startPlayback()} />
      <DebugButton label="Stop Playback" callback={() => stopPlayback()} />

      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
    </div>
  );
};
export { ClientDebug };
