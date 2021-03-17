import React, { useEffect, useState } from "react";
import { Channel, Socket, Push } from "phoenix";
import { useMetaChannel } from "../../hooks";
import { User, AdminMessage, AdminAlertPayload } from "../../types";
import { unmarshalBody } from "../../utils";
import { AlertModal } from "../common/AlertModal";

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

  const [adminMessage, setAdminMessage] = useState<string>();
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  const handleAdminMessage = (adminMessage: AdminMessage): void => {
    setAdminMessage(adminMessage.messageText);
    setShowAlertModal(true);
  };

  useEffect(() => {
    if (!!metaChannel) {
      metaChannel.on("admin_alert", (body) => {
        const { adminMessage } = unmarshalBody(body) as AdminAlertPayload;
        handleAdminMessage(adminMessage);
      });
    }
  }, [metaChannel]);

  useEffect(() => {
    if (showAlertModal) {
      const timer = setTimeout(() => {
        setShowAlertModal(false);
      }, 10_000);
      return () => clearTimeout(timer);
    }
  }, [showAlertModal]);

  return (
    <div>
      {showAlertModal ? (
        <AlertModal messageText={!!adminMessage ? adminMessage : ""} />
      ) : (
        <></>
      )}

      {children}
    </div>
  );
};
export { PageWrapper };
