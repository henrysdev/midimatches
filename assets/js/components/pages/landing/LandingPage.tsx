import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../../types";
import { SERVERLIST_UPDATE_EVENT } from "../../../constants";
import { Serverlist, HowToPlay } from ".";

const LandingPage: React.FC = () => {
  const [landingPageChannel, setLandingPageChannel] = useState<Channel>();
  const [roomStates, setRoomStates] = useState<Array<RoomState>>([]);

  useEffect(() => {
    // websocket channel init
    const windowRef = window as any;
    const socket = new Socket("/socket", {
      params: { token: windowRef.userToken },
    });
    socket.connect();
    const channel: Channel = socket.channel(`landing_page:serverlist`);

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
    channel.on(SERVERLIST_UPDATE_EVENT, (body) => {
      const { rooms } = unmarshalBody(body) as ServerlistUpdatePayload;
      setRoomStates(rooms);
    });
    setLandingPageChannel(channel);

    return () => {
      channel.leave();
    };
  }, []);
  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "auto",
        marginTop: "16px",
        padding: "24px",
        boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      <div>
        <h1 className="uk-text-center">Welcome to Progressions</h1>
        {/* <HowToPlay /> */}
        <Serverlist roomStates={roomStates} />
      </div>
    </div>
  );
};
export { LandingPage };
