import React from "react";
import { Socket } from "phoenix";
import { useUserChannel } from "../../hooks";
import { User } from "../../types";
import { AdminAlert } from ".";

interface PageWrapperProps {
  socket: Socket;
  currentUser: User;
  children?: any;
}
const PageWrapper: React.FC<PageWrapperProps> = ({
  socket,
  currentUser,
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
      {children}
    </div>
  );
};
export { PageWrapper };
