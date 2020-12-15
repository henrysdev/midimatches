import React from "react";
import { SimpleButton } from "../../common/index";
import { SUBMIT_ENTER_ROOM } from "../../../constants/index";

interface PregameLobbyViewProps {
  submitEnterRoom: Function;
}

const PregameLobbyView: React.FC<PregameLobbyViewProps> = ({
  submitEnterRoom,
}) => {
  return (
    <div>
      <h3>PregameLobby View</h3>
      <SimpleButton
        label="Join Room"
        callback={() => {
          submitEnterRoom(SUBMIT_ENTER_ROOM, {});
        }}
        disabled={false}
      />
    </div>
  );
};
export { PregameLobbyView };
