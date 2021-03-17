import { useEffect, useState } from "react";
import { Socket, Channel } from "phoenix";
import { User } from "../types";

export function useMetaChannel(
  socket: Socket,
  currentUser: User
): Channel | undefined {
  const [metaChannel, setMetaChannel] = useState<Channel>();
  useEffect(() => {
    const channel: Channel = socket.channel("meta:common", {
      player_id:
        !!currentUser && !!currentUser.userId
          ? currentUser.userId
          : "nosession",
    });
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined META successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join META", resp);
      });
    setMetaChannel(channel);
  }, []);

  return metaChannel;
}
