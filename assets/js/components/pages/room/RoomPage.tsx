import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import { PlayerJoinPayload } from "../../../types";
import { Game } from "./game/Game";
import { PregameLobby } from "./pregame/PregameLobby";
import { ToneAudioContext } from "../../../contexts";
import * as Tone from "tone";
import { useWebMidi } from "../../../hooks";

const RoomPage: React.FC = () => {
  const [gameChannel, setGameChannel] = useState<Channel>();
  const [readyToStartGame, setReadyToStartGame] = useState<boolean>(false);
  const [musicianId, setMusicianId] = useState<string>();
  const [midiInputs] = useWebMidi();

  useEffect(() => {
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
        const { musicianId } = unmarshalBody(reply) as PlayerJoinPayload;
        setMusicianId(musicianId);
      });
    }
  };

  return readyToStartGame && !!gameChannel && !!musicianId ? (
    <ToneAudioContext.Provider value={{ Tone, midiInputs }}>
      <Game gameChannel={gameChannel} musicianId={musicianId} />
    </ToneAudioContext.Provider>
  ) : (
    <PregameLobby pushMessageToChannel={playerJoin} />
  );
};
export { RoomPage };
