import React from "react";
import { Socket } from "phoenix";
import { useMetaChannel } from "../../hooks";
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
  const metaChannel = useMetaChannel(socket, currentUser);
  return (
    <div>
      <AdminAlert metaChannel={metaChannel} />
      {children}
    </div>
  );
};
export { PageWrapper };
