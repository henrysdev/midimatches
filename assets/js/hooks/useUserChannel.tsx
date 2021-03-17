import { useEffect, useState } from "react";
import { Socket, Channel } from "phoenix";

export function useUserChannel(
  socket: Socket,
  topic: string
): Channel | undefined {
  const [userChannel, setUserChannel] = useState<Channel>();
  useEffect(() => {
    const channel: Channel = socket.channel(`user:${topic}`, {});
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined user channel successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join user channel", resp);
      });
    setUserChannel(channel);
  }, []);

  return userChannel;
}
