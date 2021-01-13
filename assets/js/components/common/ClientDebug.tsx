import React, { useContext } from "react";

import { DEFAULT_SYNTH_CONFIG } from "../../constants";
import { GameContext } from "../../contexts";
import { SimpleButton } from "../common";

interface ClientDebugProps {
  musicianId: string;
}

const ClientDebug: React.FC<ClientDebugProps> = ({ musicianId }) => {
  const gameContext = useContext(GameContext);

  return (
    <div>
      <div>Musician: {musicianId}</div>
      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
    </div>
  );
};
export { ClientDebug };
