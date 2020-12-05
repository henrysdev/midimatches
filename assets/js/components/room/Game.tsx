import React from "react";
import { useState } from "react";
import { GenericView, RecordingView } from './views/index';
import { Socket } from "phoenix"
import { GAME_VIEW } from '../../constants/index';

interface GameProps {}

const Game: React.FC<GameProps> = () => {
  const [currentView, setCurrentView] = useState(GAME_VIEW.SAMPLE_RECORDING);

  const changeView = (nextView: GAME_VIEW) => {
    setCurrentView(nextView);
  }

  // SOCKET STUFF
  let socket = new Socket("/socket", {params: {token: window.userToken}});
  socket.connect()
  let path              = window.location.pathname.split('/')
  let room_id           = path[path.length -1]
  let channel           = socket.channel(`room:${room_id}`);
  let roomStartTime     = 0;
  channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp)})
  .receive("error", resp => { console.log("Unable to join", resp)});

  channel.on("init_room_client", ({start_time_utc}) => {
    roomStartTime = start_time_utc;
  });

  channel.on("broadcast_updated_musician_loop", payload => {
    console.log('RECV broadcast_updated_musician_loop', payload);
  });

  channel.on("game_view", payload => {
    console.log("game view: ", payload);
    setCurrentView(payload);
  });

  // channel.push("update_musician_loop", {
  //   loop: JSON.stringify({})
  // });

  switch(currentView) {
    case GAME_VIEW.START:
      console.log("START");
      return (
        <GenericView currentView={currentView} nextViewCallback={() => changeView(GAME_VIEW.INPUT_TEST)} />
      );
    case GAME_VIEW.INPUT_TEST:
      console.log("INPUT_TEST");
      return (
        <GenericView currentView={currentView} nextViewCallback={() => changeView(GAME_VIEW.SAMPLE_RECORDING)} />
      );
    case GAME_VIEW.SAMPLE_RECORDING:
      console.log("SAMPLE_RECORDING");
      return (
        <RecordingView channel={channel} nextViewCallback={() => changeView(GAME_VIEW.SAMPLE_PLAYBACK)} /> 
      );
    case GAME_VIEW.SAMPLE_PLAYBACK:
      console.log("SAMPLE_PLAYBACK");
      return (
        <GenericView currentView={currentView} nextViewCallback={() => changeView(GAME_VIEW.VOTING)} />
      );
    case GAME_VIEW.VOTING:
      console.log("VOTING");
      return (
        <GenericView currentView={currentView} nextViewCallback={() => changeView(GAME_VIEW.RESULTS)} />
      );
    case GAME_VIEW.RESULTS:
      console.log("RESULTS");
      return (
        <GenericView currentView={currentView} nextViewCallback={() => changeView(GAME_VIEW.START)} />
      );
    default:
      console.log('unrecognized event type encountered: ', currentView);
  }
  return (
    <>
    </>
  );
};
export { Game };