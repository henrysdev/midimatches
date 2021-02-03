import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  ViewUpdatePayload,
  InitConnPayload,
} from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import { PlayerContext } from "../../../contexts";
import {
  START_GAME_EVENT,
  RESET_ROOM_EVENT,
  INIT_CONN_EVENT,
  SUBMIT_LEAVE_ROOM,
} from "../../../constants";

const RoomPage: React.FC = () => {
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameInProgress, setGameInProgress] = useState<boolean>(false);
  const [currPlayer, setCurrPlayer] = useState<Player>();
  const [initGameState, setInitGameState] = useState<GameContextType>();

  const resetRoom = () => {
    setGameInProgress(false);
    setCurrPlayer(undefined);
    setInitGameState(undefined);
  };

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

    // join game
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    // room status
    channel.on(INIT_CONN_EVENT, (body) => {
      const { gameInProgress } = unmarshalBody(body) as InitConnPayload;
      setGameInProgress(gameInProgress);
    });

    // start game
    channel.on(START_GAME_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as ViewUpdatePayload;
      setInitGameState(gameState);
      setGameInProgress(true);
    });

    // reset room
    channel.on(RESET_ROOM_EVENT, (_body) => {
      resetRoom();
    });

    // leave room
    window.addEventListener("beforeunload", () => {
      channel.push(SUBMIT_LEAVE_ROOM, {});
    });

    setGameChannel(channel);

    return () => {
      channel.leave();
    };
  }, []);

  const playerJoin = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload).receive("ok", (reply) => {
        const { player } = unmarshalBody(reply) as PlayerJoinPayload;
        setCurrPlayer(player);
      });
    }
  };

  return gameInProgress && !!gameChannel && !!currPlayer && !!initGameState ? (
    <PlayerContext.Provider value={{ player: currPlayer }}>
      <Game gameChannel={gameChannel} initGameState={initGameState} />
    </PlayerContext.Provider>
  ) : (
    <PregameLobby
      pushMessageToChannel={playerJoin}
      gameInProgress={gameInProgress}
    />
  );
};
export { RoomPage };
