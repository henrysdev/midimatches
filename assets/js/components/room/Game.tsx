import React, { useEffect, useState } from "react";
import { GenericView, RecordingView } from './views/index';
import { Socket, Channel } from "phoenix"
import { GAME_VIEW } from '../../constants/index';
import { GameContext } from '../../contexts/index';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.SAMPLE_RECORDING);
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameContext, setGameContext] = useState({});

  useEffect(() => {
    let socket = new Socket("/socket", {params: {token: window.userToken}});
    socket.connect()
    let path              = window.location.pathname.split('/')
    let room_id           = path[path.length -1]
    let channel: Channel  = socket.channel(`room:${room_id}`);
    channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp)})
    .receive("error", resp => { console.log("Unable to join", resp)});

    setGameChannel(channel);
  }, []);

  useEffect(() => {
    console.log('GAME CONTEXT CHANGED: ', gameContext)
  }, [gameContext]);

  if (!!gameChannel) {
    gameChannel.on("init_room_client", ({start_time_utc}) => {
      console.log('WEBSOCKET INIT MESSAGE')
      setGameContext({
        roomStartTime: start_time_utc,
        timestepSize: 1000,
        quantizationThreshold: 0.5,
        // TODO get other players names and ids
        // TODO get player's name
      })
    });
  
    gameChannel.on("broadcast_updated_musician_loop", payload => {
      console.log('RECV broadcast_updated_musician_loop', payload);
    });
  
    gameChannel.on("set_game_view", ({ game_view }) => {
      setCurrentView(game_view);
    });
  }

  const pushMessageToChannel = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  }

  return (
    <GameContext.Provider value={gameContext}>
      {(() => {
        switch(currentView) {
          case GAME_VIEW.START:
            console.log("START");
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.INPUT_TEST)} />
            );
          case GAME_VIEW.INPUT_TEST:
            console.log("INPUT_TEST");
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.SAMPLE_RECORDING)} />
            );
          case GAME_VIEW.SAMPLE_RECORDING:
            console.log("SAMPLE_RECORDING");
            return (
              <RecordingView channelPushCallback={pushMessageToChannel} /> 
            );
          case GAME_VIEW.SAMPLE_PLAYBACK:
            console.log("SAMPLE_PLAYBACK");
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.VOTING)} />
            );
          case GAME_VIEW.VOTING:
            console.log("VOTING");
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.RESULTS)} />
            );
          case GAME_VIEW.RESULTS:
            console.log("RESULTS");
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.START)} />
            );
          default:
            return (
              <GenericView currentView={currentView} nextViewCallback={() => setCurrentView(GAME_VIEW.INPUT_TEST)} />
            );
        }
      })()}
    </GameContext.Provider>
  );
};
export { Game };
