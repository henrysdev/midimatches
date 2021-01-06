import { Channel, Socket } from 'phoenix';
import React, { useEffect, useState } from 'react';

import { GAME_VIEW } from '../../../../constants';
import { GameContext } from '../../../../contexts';
import { GameContextType, Musician } from '../../../../types';
import { gameViewAtomToEnum, unmarshalBody } from '../../../../utils';
import { GameContextDebug } from '../../../common';
import { GameEndView, GameStartView, PlaybackVotingView, PregameLobbyView, RecordingView } from './views';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.PREGAME_LOBBY);
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameContext, setGameContext] = useState<GameContextType>({});
  const [musicianId, setMusicianId] = useState<string>();

  useEffect(() => {
    let socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();
    let path = window.location.pathname.split("/");
    let room_id = path[path.length - 1];
    let channel: Channel = socket.channel(`room:${room_id}`);
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
    channel.on("view_update", (body) => {
      const { view, gameState } = unmarshalBody(body);
      const gameView = gameViewAtomToEnum(view);
      setCurrentView(gameView);
      setGameContext(gameState);
    });
    setGameChannel(channel);
  }, []);

  const playerJoin = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload).receive("ok", (reply) => {
        const { musicianId } = unmarshalBody(reply);
        setMusicianId(musicianId);
      });
    }
  };

  const genericPushMessage = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.PREGAME_LOBBY:
            return <PregameLobbyView pushMessageToChannel={playerJoin} />;

          case GAME_VIEW.GAME_START:
            return <GameStartView pushMessageToChannel={genericPushMessage} />;

          case GAME_VIEW.RECORDING:
            return <RecordingView pushMessageToChannel={genericPushMessage} />;

          case GAME_VIEW.PLAYBACK_VOTING:
            return (
              <PlaybackVotingView
                pushMessageToChannel={genericPushMessage}
                eligibleMusiciansToVoteFor={
                  // TODO replace with contestants when added to game context
                  gameContext.musicians
                    .map(({ musicianId }: Musician) => musicianId)
                    .filter((mId: string) => mId !== musicianId)
                }
              />
            );

          case GAME_VIEW.GAME_END:
            return <GameEndView />;

          default:
            console.log("CATCH ALL DEBUG CURRENT VIEW: ", currentView);
            return <div></div>;
        }
      })()}
      <GameContextDebug />
    </GameContext.Provider>
  );
};
export { Game };
