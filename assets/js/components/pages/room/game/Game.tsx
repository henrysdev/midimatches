import React, { useEffect, useState } from "react";
import {
  PregameLobbyView,
  GameStartView,
  RecordingView,
  PlaybackVotingView,
  GameEndView,
} from "./views/index";
import { Socket, Channel } from "phoenix";
import { GAME_VIEW } from "../../../../constants/index";
import { GameContext } from "../../../../contexts/index";
import { GameContextType } from "../../../../types/index";
import { GameContextDebug } from "../../../common/index";
import {
  gameViewAtomToEnum,
  formatServerPayload,
} from "../../../../utils/index";

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.PREGAME_LOBBY);
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameContext, setGameContext] = useState<GameContextType>({});

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
    channel.on("view_update", ({ view, game_state }) => {
      const gameView = gameViewAtomToEnum(view);
      const payload = formatServerPayload(game_state);
      setCurrentView(gameView);
      setGameContext(payload);
    });
    setGameChannel(channel);
  }, []);

  const pushMessageToChannel = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.PREGAME_LOBBY:
            return (
              <PregameLobbyView pushMessageToChannel={pushMessageToChannel} />
            );

          case GAME_VIEW.GAME_START:
            return (
              <GameStartView pushMessageToChannel={pushMessageToChannel} />
            );

          case GAME_VIEW.RECORDING:
            return (
              <RecordingView pushMessageToChannel={pushMessageToChannel} />
            );

          case GAME_VIEW.PLAYBACK_VOTING:
            return (
              <PlaybackVotingView
                pushMessageToChannel={pushMessageToChannel}
                eligibleMusiciansToVoteFor={gameContext.musicians
                  .map(({ musicianId }) => musicianId)
                  .filter((mId) => {
                    return mId !== "TODO MUST KNOW YOUR OWN PLAYER ID...";
                  })}
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
