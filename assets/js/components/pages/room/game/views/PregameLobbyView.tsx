import React, { useEffect } from "react";
import { SimpleButton } from "../../../../common/index";
import {
  SUBMIT_ENTER_ROOM,
  SUBMIT_LEAVE_ROOM,
} from "../../../../../constants/index";

interface PregameLobbyViewProps {
  pushMessageToChannel: Function;
}

const PregameLobbyView: React.FC<PregameLobbyViewProps> = ({
  pushMessageToChannel,
}) => {
  window.addEventListener("beforeunload", () =>
    pushMessageToChannel(SUBMIT_LEAVE_ROOM, {})
  );

  return (
    <div>
      <h3>PregameLobby View</h3>
      <SimpleButton
        label="Join Room"
        callback={() => {
          pushMessageToChannel(SUBMIT_ENTER_ROOM, {});
        }}
        disabled={false}
      />
    </div>
  );
};
export { PregameLobbyView };
