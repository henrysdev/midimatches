import { useMemo } from "react";
import { Socket } from "phoenix";

export function useSocket(): Socket {
  const socket = useMemo(() => {
    const windowRef = window as any;
    const { userToken } = windowRef;
    const socket = new Socket("/socket", {
      params: { token: userToken },
    });
    socket.connect();
    return socket;
  }, []);

  return socket;
}
