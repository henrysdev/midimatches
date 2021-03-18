import React, { useState, useEffect } from "react";
import { Channel } from "phoenix";
import { AdminMessage, AdminAlertPayload } from "../../types";
import { unmarshalBody } from "../../utils";
import {
  DEFAULT_ALERT_LIFETIME,
  ADMIN_ALERT_MESSAGE_EVENT,
} from "../../constants";
import { MediumLargeTitle } from "../common";

interface AdminAlertProps {
  userChannel?: Channel;
  allUsersChannel?: Channel;
}
const AdminAlert: React.FC<AdminAlertProps> = ({
  userChannel,
  allUsersChannel,
}) => {
  useEffect(() => {
    if (!!userChannel) {
      userChannel.on(ADMIN_ALERT_MESSAGE_EVENT, (body) => {
        const { adminMessage } = unmarshalBody(body) as AdminAlertPayload;
        handleAdminAlertMessage(adminMessage);
      });
    }
    if (!!allUsersChannel) {
      allUsersChannel.on(ADMIN_ALERT_MESSAGE_EVENT, (body) => {
        const { adminMessage } = unmarshalBody(body) as AdminAlertPayload;
        handleAdminAlertMessage(adminMessage);
      });
    }
  }, [userChannel, allUsersChannel]);

  const [adminMessage, setAdminMessage] = useState<AdminMessage>();
  const [showAdminAlert, setShowAdminAlert] = useState<boolean>(false);

  const handleAdminAlertMessage = (adminMessage: AdminMessage): void => {
    setAdminMessage(adminMessage);
    setShowAdminAlert(true);
  };

  const closeModal = () => {
    setShowAdminAlert(false);
  };

  useEffect(() => {
    if (showAdminAlert) {
      const timer = setTimeout(
        () => {
          setShowAdminAlert(false);
        },
        !!adminMessage && !!adminMessage.alertLifetime
          ? adminMessage.alertLifetime
          : DEFAULT_ALERT_LIFETIME
      );
      return () => clearTimeout(timer);
    }
  }, [showAdminAlert]);

  return (
    <div>
      {showAdminAlert ? (
        <div className="alert_modal relative_anchor">
          <div className="alert_modal_content centered_div">
            <span onClick={closeModal} className="alert_modal_close">
              &times;
            </span>
            <div className="centered_title alert_title roboto_font">
              Admin Alert
            </div>
            <p className="warning_alert">{adminMessage?.messageText}</p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
export { AdminAlert };
