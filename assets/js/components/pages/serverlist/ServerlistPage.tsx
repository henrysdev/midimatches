import { Channel, Socket } from "phoenix";
import React, { useEffect, useState, useRef } from "react";

import { unmarshalBody } from "../../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../../types";
import { SERVERLIST_UPDATE_EVENT } from "../../../constants";
import { Serverlist } from ".";
import { EditUser, Button } from "../../common";

const ServerlistPage: React.FC = () => {
  const [roomStates, setRoomStates] = useState<Array<RoomState>>([]);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<number>(0);
  const [lastRefresh, _setLastRefresh] = useState<number>(0);
  const lastRefreshRef = useRef({});
  const setLastRefresh = (data: any) => {
    lastRefreshRef.current = data;
    _setLastRefresh(data);
  };

  useEffect(() => {
    // websocket channel init
    const windowRef = window as any;
    const socket = new Socket("/socket", {
      params: { token: windowRef.userToken },
    });
    socket.connect();
    const channel: Channel = socket.channel("servers:serverlist");

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
      setLastRefresh(Date.now());
    });

    const refreshInterval = setInterval(() => {
      const now = Date.now();
      const last = lastRefreshRef.current as number;
      setTimeSinceRefresh(now - last);
    }, 500);

    return () => {
      clearInterval(refreshInterval);
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
        <Serverlist
          roomStates={roomStates}
          timeSinceRefresh={timeSinceRefresh}
        />
      </div>
    </div>
  );
};
export { ServerlistPage };
