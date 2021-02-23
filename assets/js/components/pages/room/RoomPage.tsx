import { Channel, Socket, Push } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

import * as Tone from "tone";
import { Input } from "webmidi";
import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
  RoomState,
} from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import { PlayerContext, ToneAudioContext } from "../../../contexts";
import {
  START_GAME_EVENT,
  LOBBY_UPDATE_EVENT,
  RESET_ROOM_EVENT,
  SUBMIT_LEAVE_ROOM,
  SUBMIT_JOIN,
  DEFAULT_FM_SYNTH_CONFIG,
} from "../../../constants";
import {
  useCurrentUserContext,
  useSocketContext,
  useWebMidi,
} from "../../../hooks";

const RoomPage: React.FC = () => {
  // midi inputs init
  const [originalMidiInputs] = useWebMidi();
  const [midiInputs, setMidiInputs] = useState<Array<Input>>([]);
  const [disabledMidiInputIds, setDisabledMidiInputIds] = useState<
    Array<string>
  >([]);
  useEffect(() => {
    if (!!originalMidiInputs) {
      setMidiInputs(
        originalMidiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    }
  }, [originalMidiInputs]);

  // synth + Tone init
  const [synth, setSynth] = useState<any>();
  useEffect(() => {
    Tone.context.lookAhead = 0;
    Tone.Master.volume.value = -1;

    const autoWah = new Tone.AutoWah(60, 6, -30).toDestination();
    const chorus = new Tone.Chorus(3, 0.5, 0.5).start();
    const vibrato = new Tone.Vibrato("16n", 0.05);

    const newSynth = new Tone.PolySynth(Tone.FMSynth, DEFAULT_FM_SYNTH_CONFIG);

    newSynth.chain(vibrato, chorus, Tone.Destination);

    // const newSynth = new Tone.Sampler({
    //   urls: {
    //     C4: "funk_daddy_c4.mp3",
    //     C5: "funk_daddy_c5.mp3",
    //   },
    //   baseUrl: "https://progressions-game.s3.amazonaws.com/synths/funk_daddy/",
    // }).toDestination();
    setSynth(newSynth);
  }, []);

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
      <ToneAudioContext.Provider
        value={{
          Tone,
          midiInputs,
          setMidiInputs,
          disabledMidiInputIds,
          setDisabledMidiInputIds,
          originalMidiInputs,
          synth,
        }}
      >
        {!!gameChannel && !!currPlayer && !!initGameState ? (
          <PlayerContext.Provider value={{ player: currPlayer }}>
            <Game gameChannel={gameChannel} initGameState={initGameState} />
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
      </ToneAudioContext.Provider>
    </div>
  );
};
export { RoomPage };
