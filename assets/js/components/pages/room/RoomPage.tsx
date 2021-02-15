import { Channel, Socket, Push } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
} from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import { PlayerContext } from "../../../contexts";
import {
  START_GAME_EVENT,
  LOBBY_UPDATE_EVENT,
  RESET_ROOM_EVENT,
  SUBMIT_LEAVE_ROOM,
} from "../../../constants";
import { useCurrentUserContext } from "../../../hooks";

const RoomPage: React.FC = () => {
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameInProgress, setGameInProgress] = useState<boolean>(false);
  const [currPlayer, setCurrPlayer] = useState<Player>();
  const [initGameState, setInitGameState] = useState<GameContextType>();
  const [lobbyState, setLobbyState] = useState<any>({
    numPlayersJoined: 0,
    numPlayersToStart: 0,
  });
  const { user: currentUser } = useCurrentUserContext();

  const resetRoom = () => {
    setGameInProgress(false);
    setInitGameState(undefined);
  };

  useEffect(() => {
    // websocket channel init
    const windowRef = window as any;
    const { userToken } = windowRef;
    const socket = new Socket("/socket", {
      params: { token: userToken },
    });
    setCurrPlayer({
      musicianId: currentUser.userId,
      playerAlias: currentUser.userAlias,
    });
    socket.connect();
    const path = window.location.pathname.split("/");
    const roomId = path[path.length - 1];
    const channel: Channel = socket.channel(`room:${roomId}`, {
      player_id: currentUser.userId,
    });

    // join game
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    // lobby update
    channel.on(LOBBY_UPDATE_EVENT, (body) => {
      const {
        numPlayersJoined,
        numPlayersToStart,
        gameInProgress,
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setGameInProgress(gameInProgress);
      setLobbyState({ numPlayersJoined, numPlayersToStart });
    });

    // start game
    channel.on(START_GAME_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as StartGamePayload;
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

  const pushMessageToServer = (
    event: string,
    payload: Object
  ): Push | undefined => {
    if (!!gameChannel) {
      return gameChannel.push(event, payload);
    }
  };

  return (
    <div>
      {gameInProgress && !!gameChannel && !!currPlayer && !!initGameState ? (
        <PlayerContext.Provider value={{ player: currPlayer }}>
          <Game gameChannel={gameChannel} initGameState={initGameState} />
        </PlayerContext.Provider>
      ) : (
        <PregameLobby
          submitPlayerJoin={pushMessageToServer}
          gameInProgress={gameInProgress}
          numPlayersJoined={lobbyState.numPlayersJoined}
          numPlayersToStart={lobbyState.numPlayersToStart}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
export { RoomPage };
