import { Channel, Socket, Push } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

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
  SUBMIT_JOIN,
} from "../../../constants";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";

const RoomPage: React.FC = () => {
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameInProgress, setGameInProgress] = useState<boolean>(false);
  const [currPlayer, setCurrPlayer] = useState<Player>();
  const [initGameState, setInitGameState] = useState<GameContextType>();
  const [lobbyState, setLobbyState] = useState<any>({
    numPlayersJoined: 0,
    numPlayersToStart: 0,
    roomName: "",
  });
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const resetRoom = () => {
    setGameInProgress(false);
    setInitGameState(undefined);
  };

  useEffect(() => {
    setCurrPlayer({
      playerId: currentUser.userId,
      playerAlias: currentUser.userAlias,
    });
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
        roomName,
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setGameInProgress(gameInProgress);
      setLobbyState({ numPlayersJoined, numPlayersToStart, roomName });
    });

    // start game
    channel.on(START_GAME_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as StartGamePayload;
      setInitGameState(gameState);
      setGameInProgress(true);
    });

    // reset room
    channel.on(RESET_ROOM_EVENT, (_body) => {
      const sentMessage = channel.push(SUBMIT_JOIN, {
        player_alias: currentUser.userAlias,
        player_id: currentUser.userId,
      });
      if (!!sentMessage) {
        sentMessage
          .receive("ok", (_reply: any) => {
            console.log("reset rejoin successful");
          })
          .receive("error", (err: any) => {
            console.error("join game error: ", err);
          });
      }
      resetRoom();
    });

    // leave room
    window.addEventListener("beforeunload", () => {
      channel.push(SUBMIT_LEAVE_ROOM, {});
      channel.leave();
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

  const playerIsPlaying = useMemo(() => {
    if (gameInProgress && !!gameChannel && !!currPlayer && !!initGameState) {
      return !!initGameState.players
        ? initGameState.players
            .map((player) => player.playerId)
            .includes(currPlayer.playerId)
        : false;
    }
    return false;
  }, [gameInProgress, currPlayer, initGameState]);

  const submitPlayerJoin = (): any => {
    return pushMessageToServer(SUBMIT_JOIN, {
      player_alias: currentUser.userAlias,
      player_id: currentUser.userId,
    });
  };

  return (
    <div>
      {playerIsPlaying && !!gameChannel && !!currPlayer && !!initGameState ? (
        <PlayerContext.Provider value={{ player: currPlayer }}>
          <Game gameChannel={gameChannel} initGameState={initGameState} />
        </PlayerContext.Provider>
      ) : !!gameChannel ? (
        <PregameLobby
          submitPlayerJoin={submitPlayerJoin}
          gameInProgress={gameInProgress}
          numPlayersJoined={lobbyState.numPlayersJoined}
          numPlayersToStart={lobbyState.numPlayersToStart}
          currentUser={currentUser}
          roomName={lobbyState.roomName}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
export { RoomPage };
