import React, { useState, useEffect } from "react";
import { Channel, Socket } from "phoenix";
import { unmarshalBody } from "../../utils";
import {
  DEFAULT_ALERT_LIFETIME,
  DUPLICATE_SESSION_EVENT,
} from "../../constants";
import { MediumLargeTitle, InlineWidthButton, MaterialIcon } from "../common";

interface DuplicateSessionAlertProps {
  socket: Socket;
  beforeSocketClose?: Function;
  userChannel?: Channel;
}
const DuplicateSessionAlert: React.FC<DuplicateSessionAlertProps> = ({
  socket,
  beforeSocketClose = () => {},
  userChannel,
}) => {
  useEffect(() => {
    if (!!userChannel) {
      userChannel.on(DUPLICATE_SESSION_EVENT, (body) => {
        setShowDuplicateSessionAlert(true);
      });
    }
  }, [userChannel]);

  const [
    showDuplicateSessionAlert,
    setShowDuplicateSessionAlert,
  ] = useState<boolean>(false);

  useEffect(() => {
    if (!!showDuplicateSessionAlert && !!userChannel) {
      beforeSocketClose();
      socket.disconnect();
    }
  }, [showDuplicateSessionAlert]);

  return (
    <div>
      {showDuplicateSessionAlert ? (
        <div className="alert_modal relative_anchor">
          <div className="alert_modal_content centered_div">
            <div className="centered_title alert_title roboto_font">
              Stale Browser Tab
            </div>
            <br />
            <p>
              A newer browser tab has been used to play on behalf of your user.
              Midi Matches is intended to be played in a single browser tab at
              once.
            </p>

            <InlineWidthButton callback={() => window.location.reload()}>
              <h4>REFRESH</h4>
            </InlineWidthButton>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
export { DuplicateSessionAlert };
