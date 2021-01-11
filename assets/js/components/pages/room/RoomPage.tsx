import { Channel, Socket } from 'phoenix';
import React, { useEffect, useState } from 'react';

import { unmarshalBody } from '../../../utils';
import { Game } from './game/Game';
import { PregameLobby } from './pregame/PregameLobby';

const RoomPage: React.FC = () => {
  // TODO
  // 1. Open up socket connection here
  // 2. Have function that renders game on game start message receieved

  const [gameChannel, setGameChannel] = useState<Channel>();
  const [readyToStartGame, setReadyToStartGame] = useState<boolean>(false);
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

    // listen for start game message
    channel.on("start_game", (_body) => {
      console.log("starting game!!");
      setReadyToStartGame(true);
    });
    setGameChannel(channel);
  }, []);

  const playerJoin = (event: string, payload: Object) => {
    if (!!gameChannel) {
      console.log("player joining!");
      gameChannel.push(event, payload).receive("ok", (reply) => {
        const { musicianId } = unmarshalBody(reply);
        setMusicianId(musicianId);
      });
    }
  };

  console.log("ready to start? ", readyToStartGame);
  console.log("MUSICIAN_ID: ", musicianId);

  return readyToStartGame ? (
    <Game gameChannel={gameChannel} musicianId={musicianId} />
  ) : (
    <PregameLobby pushMessageToChannel={playerJoin} />
  );
};
export { RoomPage };
