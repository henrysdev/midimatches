import React from "react";

import { useGameContext, useToneAudioContext } from "../../hooks";
import { DebugButton } from "./";
import { useSamplePlayer } from "../../hooks";

interface ClientDebugProps {
  playerId: string;
}

const ClientDebug: React.FC<ClientDebugProps> = ({ playerId }) => {
  const gameContext = useGameContext();
  const { Tone } = useToneAudioContext();
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);

  return (
    <div>
      <div>Musician: {playerId}</div>
      {/* <pre>{JSON.stringify(gameContext, null, 2)}</pre> */}
    </div>
  );
};
export { ClientDebug };
