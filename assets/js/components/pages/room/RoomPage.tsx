import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import { PlayerJoinPayload, Player } from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import { PlayerContext } from "../../../contexts";

const RoomPage: React.FC = () => {
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [readyToStartGame, setReadyToStartGame] = useState<boolean>(false);
  const [currPlayer, setCurrPlayer] = useState<Player>();

  useEffect(() => {
    // websocket channel init
    const windowRef = window as any;
    const socket = new Socket("/socket", {
      params: { token: windowRef.userToken },
    });
    socket.connect();
    const path = window.location.pathname.split("/");
    const roomId = path[path.length - 1];
    const channel: Channel = socket.channel(`room:${roomId}`);
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    channel.on("start_game", (_body) => {
      setReadyToStartGame(true);
    });
    setGameChannel(channel);
  }, []);

  const playerJoin = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload).receive("ok", (reply) => {
        const { player } = unmarshalBody(reply) as PlayerJoinPayload;
        setCurrPlayer(player);
      });
    }
  };

  return readyToStartGame && !!gameChannel && !!currPlayer ? (
    <PlayerContext.Provider value={{ player: currPlayer }}>
      <Game gameChannel={gameChannel} />
    </PlayerContext.Provider>
  ) : (
    <PregameLobby pushMessageToChannel={playerJoin} />
  );
};
export { RoomPage };
