import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import {
  PlayerJoinPayload,
  Player,
  GameContextType,
  StartGamePayload,
  LobbyUpdatePayload,
} from "../../../types";
import { PlayerContext } from "../../../contexts";
import {
  START_GAME_EVENT,
  LOBBY_UPDATE_EVENT,
  RESET_ROOM_EVENT,
  SUBMIT_LEAVE_ROOM,
} from "../../../constants";

const LandingPage: React.FC = () => {
  const [landingPageChannel, setLandingPageChannel] = useState<Channel>();

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

    // server list update
    // channel.on("SERVER_LIST_UPDATE_EVENT", (body) => {
    //   const { roomsList } = unmarshalBody(body);
    // });
    // setLandingPageChannel(channel);

    return () => {
      channel.leave();
    };
  }, []);
  return (
    <div>
      <h1>Server List</h1>
    </div>
  );
};
export { LandingPage };
