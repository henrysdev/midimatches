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

    // channel init
    const path = window.location.pathname.split("/");
    const roomId = path[path.length - 1];
    const channel: Channel = socket.channel(`room:${roomId}`, {
      player_id: currentUser.userId,
    });
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    const joinRoomFlow = () => {
      const sentMessage = channel.push(SUBMIT_JOIN, {
        player_alias: currentUser.userAlias,
        player_id: currentUser.userId,
      });
      if (!!sentMessage) {
        sentMessage
          .receive("ok", (body) => {
            const { roomState, gameState } = unmarshalBody(
              body
            ) as PlayerJoinPayload;
            if (roomState.inGame) {
              console.log("IN GAME");
              setInitGameState(gameState);
              setGameInProgress(true);
            } else {
              console.log("IN LOBBY");
              const {
                numCurrPlayers: numPlayersJoined,
                gameRules: { minPlayers: numPlayersToStart },
                roomName,
              } = roomState as LobbyUpdatePayload;
              setLobbyState({ numPlayersJoined, numPlayersToStart, roomName });
              setGameInProgress(false);
            }
            console.log("join game successful");
          })
          .receive("error", (err: any) => {
            console.error("join game error: ", err);
          });
      }
    };
    joinRoomFlow();

    // lobby update
    channel.on(LOBBY_UPDATE_EVENT, (body) => {
      const {
        numCurrPlayers: numPlayersJoined,
        gameRules: { minPlayers: numPlayersToStart },
        roomName,
      } = unmarshalBody(body) as LobbyUpdatePayload;
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
      joinRoomFlow();
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

  return (
    <div>
      {!!gameChannel && !!currPlayer && !!initGameState ? (
        <PlayerContext.Provider value={{ player: currPlayer }}>
          <Game gameChannel={gameChannel} initGameState={initGameState} />
        </PlayerContext.Provider>
      ) : !!gameChannel ? (
        <PregameLobby
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
