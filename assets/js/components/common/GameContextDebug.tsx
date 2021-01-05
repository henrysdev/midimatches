import React, { useContext } from 'react';
import * as Tone from 'tone';

import { DEFAULT_SYNTH_CONFIG } from '../../constants';
import { GameContext } from '../../contexts';
import { SimpleButton } from '../common';

const GameContextDebug: React.FC = () => {
  const gameContext = useContext(GameContext);
  const debugSynth = new Tone.Synth(DEFAULT_SYNTH_CONFIG).toDestination();

  return (
    <div>
      <SimpleButton
        label="play me for a middle C"
        callback={() => debugSynth.triggerAttackRelease("C4", "8n")}
        disabled={false}
      />
      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
    </div>
  );
};
export { GameContextDebug };
