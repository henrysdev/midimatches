import { Channel } from 'phoenix';
import React, { useEffect, useState } from 'react';

import { GAME_VIEW } from '../../../../constants';
import { GameContext } from '../../../../contexts';
import { GameContextType } from '../../../../types';
import { gameViewAtomToEnum, unmarshalBody } from '../../../../utils';
import { ClientDebug } from '../../../common';
import { GameEndView, GameStartView, PlaybackVotingView, RecordingView } from './views';

interface GameProps {
  gameChannel: Channel;
  musicianId: string;
}

const Game: React.FC<GameProps> = ({ gameChannel, musicianId }) => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.GAME_START);
  const [gameContext, setGameContext] = useState<GameContextType>({});

  useEffect(() => {
    gameChannel.on("view_update", (body) => {
      const { view, gameState } = unmarshalBody(body);
      const gameView = gameViewAtomToEnum(view);
      setCurrentView(gameView);
      setGameContext(gameState);
    });
  }, []);

  const genericPushMessage = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  console.log("GAME_CONTEXT_PLAYBACK_VOTING: ", gameContext);

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.GAME_START:
            return <GameStartView pushMessageToChannel={genericPushMessage} />;

          case GAME_VIEW.RECORDING:
            return (
              <RecordingView
                isContestant={gameContext.contestants.includes(musicianId)}
                pushMessageToChannel={genericPushMessage}
              />
            );

          case GAME_VIEW.PLAYBACK_VOTING:
            return (
              <PlaybackVotingView
                isJudge={gameContext.judges.includes(musicianId)}
                pushMessageToChannel={genericPushMessage}
                eligibleMusiciansToVoteFor={gameContext.contestants}
              />
            );

          case GAME_VIEW.GAME_END:
            return <GameEndView />;

          default:
            console.log("CATCH ALL DEBUG CURRENT VIEW: ", currentView);
            return <div></div>;
        }
      })()}
      <ClientDebug musicianId={musicianId} />
    </GameContext.Provider>
  );
};
export { Game };
