import React, { useEffect, useState } from "react";
import {
  PregameLobbyView,
  GameStartView,
  RecordingView,
  PlaybackVotingView,
  GameEndView,
} from "./views/index";
import { Socket, Channel } from "phoenix";
import { GAME_VIEW } from "../../constants/index";
import { GameContext } from "../../contexts/index";
import { gameViewAtomToEnum } from "../../utils/index";

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.PREGAME_LOBBY);
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameContext, setGameContext] = useState({});

  useEffect(() => {
    let socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();
    let path = window.location.pathname.split("/");
    let room_id = path[path.length - 1];
    let channel: Channel = socket.channel(`room:${room_id}`);

    channel.on("view_update", ({ view, game_state }) => {
      const gameView = gameViewAtomToEnum(view);
      setCurrentView(gameView);
      setGameContext({
        roomStartTime: game_state.room_start_time,
        timestepSize: game_state.timestep_us,
        quantizationThreshold: game_state.quantization_threshold,
      });
    });
    setGameChannel(channel);
  }, []);

  const pushMessageToChannel = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  const joinChannel = () => {
    if (!!gameChannel) {
      gameChannel
        .join()
        .receive("ok", (resp) => {
          console.log("Joined successfully", resp);
        })
        .receive("error", (resp) => {
          console.log("Unable to join", resp);
        });
    }
  };

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.PREGAME_LOBBY:
            return <PregameLobbyView joinChannel={joinChannel} />;

          case GAME_VIEW.GAME_START:
            return <GameStartView submitReadyUp={pushMessageToChannel} />;

          case GAME_VIEW.RECORDING:
            return <RecordingView submitRecording={pushMessageToChannel} />;

          case GAME_VIEW.PLAYBACK_VOTING:
            return <PlaybackVotingView submitVote={pushMessageToChannel} />;

          case GAME_VIEW.GAME_END:
            return <GameEndView />;

          default:
            console.log("CURRENT VIEW: ", currentView);
            return <div></div>;
        }
      })()}
    </GameContext.Provider>
  );
};
export { Game };
