import { Channel, Socket, Push } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
  RoomState,
  ChatMessage,
} from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import {
  PlayerContext,
  ToneAudioContext,
  ChatContext,
} from "../../../contexts";
import {
  START_GAME_EVENT,
  LOBBY_UPDATE_EVENT,
  RESET_ROOM_EVENT,
  SUBMIT_LEAVE_ROOM,
  SUBMIT_JOIN,
  NEW_CHAT_MESSAGE_EVENT,
  MAX_CHAT_HISTORY_LENGTH,
  SUBMIT_CHAT_MESSAGE,
} from "../../../constants";
import {
  useAudioContextProvider,
  useChat,
  useCurrentUserContext,
  useSocketContext,
} from "../../../hooks";
import { PregameDebug } from "../../debug";

const RoomPage: React.FC = () => {
  const toneAudioContext = useAudioContextProvider();
  const [chatHistory, handleChatMessage] = useChat(MAX_CHAT_HISTORY_LENGTH);

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
    if (!!toneAudioContext && !!toneAudioContext.stopSample) {
      toneAudioContext.stopSample();
    }
  };

  const submitChatMessageEvent = (messageText: string): void => {
    if (!!gameChannel) {
      gameChannel.push(SUBMIT_CHAT_MESSAGE, { message_text: messageText });
    }
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
              setInitGameState(gameState);
              setGameInProgress(true);
            } else {
              const {
                numCurrPlayers: numPlayersJoined,
                gameRules: { minPlayers: numPlayersToStart, maxPlayers },
                roomName,
                startGameDeadline,
              } = roomState as RoomState;
              setLobbyState({
                numPlayersJoined,
                numPlayersToStart,
                roomName,
                startGameDeadline,
                maxPlayers,
              });
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

    // receive chat
    channel.on(NEW_CHAT_MESSAGE_EVENT, (body) => {
      const chatMessage = unmarshalBody(body) as ChatMessage;
      handleChatMessage(chatMessage);
    });

    // lobby update
    channel.on(LOBBY_UPDATE_EVENT, (body) => {
      const {
        roomState: {
          numCurrPlayers: numPlayersJoined,
          gameRules: { minPlayers: numPlayersToStart, maxPlayers },
          roomName,
          startGameDeadline,
        },
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setLobbyState({
        numPlayersJoined,
        numPlayersToStart,
        roomName,
        startGameDeadline,
        maxPlayers,
      });
    });

    // start game
    channel.on(START_GAME_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as StartGamePayload;
      setInitGameState(gameState);
      setGameInProgress(true);
    });

    // reset room
    channel.on(RESET_ROOM_EVENT, (body) => {
      const {
        roomState: {
          numCurrPlayers: numPlayersJoined,
          gameRules: { minPlayers: numPlayersToStart },
          roomName,
          startGameDeadline,
        },
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setLobbyState({
        numPlayersJoined,
        numPlayersToStart,
        roomName,
        startGameDeadline,
      });
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
      <ToneAudioContext.Provider value={toneAudioContext}>
        <ChatContext.Provider value={{ chatHistory, submitChatMessageEvent }}>
          {!!gameChannel && !!currPlayer && !!initGameState ? (
            <PlayerContext.Provider value={{ player: currPlayer }}>
              <Game
                gameChannel={gameChannel}
                initGameState={initGameState}
                roomName={lobbyState.roomName}
              />
            </PlayerContext.Provider>
          ) : !!gameChannel ? (
            <PregameLobby
              gameInProgress={gameInProgress}
              numPlayersJoined={lobbyState.numPlayersJoined}
              maxPlayers={lobbyState.maxPlayers}
              numPlayersToStart={lobbyState.numPlayersToStart}
              startGameDeadline={lobbyState.startGameDeadline}
              currentUser={currentUser}
              roomName={lobbyState.roomName}
            />
          ) : (
            <></>
          )}
        </ChatContext.Provider>
      </ToneAudioContext.Provider>
      {/* <PregameDebug /> */}
    </div>
  );
};
export { RoomPage };
