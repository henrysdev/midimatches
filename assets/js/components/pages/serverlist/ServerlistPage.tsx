import { Channel, Socket } from "phoenix";
import React, { useEffect, useState, useRef } from "react";

import { unmarshalBody, currUtcTimestamp } from "../../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../../types";
import { SERVERLIST_UPDATE_EVENT } from "../../../constants";
import { Serverlist } from ".";
import { useSocketContext, useCurrentUserContext } from "../../../hooks";
import { ComputerFrame } from "../../common";
import { PageWrapper } from "../";

const ServerlistPage: React.FC = () => {
  const [roomStates, setRoomStates] = useState<Array<RoomState>>([]);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<number>(0);
  const [lastRefresh, _setLastRefresh] = useState<number>(0);
  const lastRefreshRef = useRef({});
  const setLastRefresh = (data: any) => {
    lastRefreshRef.current = data;
    _setLastRefresh(data);
  };
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  useEffect(() => {
    const channel: Channel = socket.channel("matchmaking:serverlist");
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
      setLastRefresh(currUtcTimestamp());
    });

    const refreshInterval = setInterval(() => {
      const now = currUtcTimestamp();
      const last = lastRefreshRef.current as number;
      setTimeSinceRefresh(now - last);
    }, 500);

    return () => {
      clearInterval(refreshInterval);
      channel.leave();
    };
  }, []);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="serverlist_page_content">
          <Serverlist
            roomStates={roomStates}
            timeSinceRefresh={timeSinceRefresh}
          />
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { ServerlistPage };
