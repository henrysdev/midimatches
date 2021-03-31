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
  KeyboardInputContext,
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
  useClockOffsetContext,
} from "../../../hooks";
import { PregameDebug } from "../../debug";
import { PageWrapper } from "..";

interface RoomPageContentProps {
  roomId: string;
  isAudienceMember: boolean;
}

const RoomPageContent: React.FC<RoomPageContentProps> = ({
  roomId,
  isAudienceMember,
}) => {
  const toneAudioContext = useAudioContextProvider();
  const [chatHistory, handleChatMessage] = useChat();
  const [disableKeyboardInput, setDisableKeyboardInput] = useState<boolean>(
    false
  );
  const [showKeyboardLabels, setShowKeyboardLabels] = useState<boolean>(true);

  const [gameChannel, setGameChannel] = useState<Channel>();
  const [gameInProgress, setGameInProgress] = useState<boolean>(false);
  const [currPlayer, setCurrPlayer] = useState<Player>();
  const [initGameState, setInitGameState] = useState<GameContextType>();
  const [lobbyState, setLobbyState] = useState<any>({
    numPlayersToStart: 0,
    roomName: "",
  });
  const { clockOffset } = useClockOffsetContext();
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const resetRoom = () => {
    window.location.href = `/room/${roomId}/${
      isAudienceMember ? "watch" : "play"
    }`;
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

    const channel: Channel = socket.channel(`room:${roomId}`, {
      user_id: currentUser.userId,
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
        is_audience_member: isAudienceMember,
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
                gameRules: { minPlayers: numPlayersToStart, maxPlayers },
                roomName,
                roomPlayers,
                startGameDeadline,
              } = roomState as RoomState;
              setLobbyState({
                numPlayersToStart,
                roomName,
                startGameDeadline,
                maxPlayers,
                roomPlayers,
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
          roomPlayers,
          gameRules: { minPlayers: numPlayersToStart, maxPlayers },
          roomName,
          startGameDeadline,
        },
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setLobbyState({
        numPlayersToStart,
        roomName,
        startGameDeadline,
        maxPlayers,
        roomPlayers,
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
          roomPlayers,
          gameRules: { minPlayers: numPlayersToStart },
          roomName,
          startGameDeadline,
        },
      } = unmarshalBody(body) as LobbyUpdatePayload;
      setLobbyState({
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
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ToneAudioContext.Provider value={toneAudioContext}>
        <KeyboardInputContext.Provider
          value={{
            setDisableKeyboardInput,
            disableKeyboardInput,
            setShowKeyboardLabels,
            showKeyboardLabels,
          }}
        >
          <PlayerContext.Provider
            value={{
              player: currPlayer,
              isAudienceMember,
            }}
          >
            <ChatContext.Provider
              value={{ chatHistory, submitChatMessageEvent }}
            >
              {!!gameChannel && !!currPlayer && !!initGameState ? (
                <Game
                  gameChannel={gameChannel}
                  initGameState={initGameState}
                  roomName={lobbyState.roomName}
                  clockOffset={clockOffset}
                />
              ) : !!gameChannel ? (
                <PregameLobby
                  gameInProgress={gameInProgress}
                  roomPlayers={lobbyState.roomPlayers}
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
          </PlayerContext.Provider>
        </KeyboardInputContext.Provider>
      </ToneAudioContext.Provider>
      {/* <PregameDebug /> */}
    </PageWrapper>
  );
};
export { RoomPageContent };
