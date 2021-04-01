import React from "react";
import { Socket, Channel } from "phoenix";
import { useUserChannel } from "../../hooks";
import { User } from "../../types";
import { SUBMIT_LEAVE_ROOM } from "../../constants";
import { AdminAlert, BrowserWarning, DuplicateSessionAlert } from ".";

interface PageWrapperProps {
  socket: Socket;
  currentUser: User;
  roomChannel?: Channel;
  children?: any;
}
const PageWrapper: React.FC<PageWrapperProps> = ({
  socket,
  currentUser,
  roomChannel,
  children,
}) => {
  const allUsersChannel = useUserChannel(socket, "all");
  const userChannel = useUserChannel(
    socket,
    !!currentUser && !!currentUser.userId ? currentUser.userId : "nosession"
  );

  return (
    <div>
      <AdminAlert allUsersChannel={allUsersChannel} userChannel={userChannel} />
      <DuplicateSessionAlert
        socket={socket}
        userChannel={userChannel}
        beforeSocketClose={
          !!roomChannel
            ? () => {
                console.log("LEAVING ROOM");
                roomChannel.push(SUBMIT_LEAVE_ROOM, {});
                roomChannel.leave();
              }
            : () => {}
        }
      />
      {children}
      <BrowserWarning />
    </div>
  );
};
export { PageWrapper };
