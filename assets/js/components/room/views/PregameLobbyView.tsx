import React from "react";
import { SimpleButton } from "../../common/index";

interface PregameLobbyViewProps {
  joinChannel: Function;
}

const PregameLobbyView: React.FC<PregameLobbyViewProps> = ({ joinChannel }) => {
  return (
    <div>
      <h3>PregameLobby View</h3>
      <SimpleButton
        label="Join Room"
        callback={() => {
          joinChannel();
        }}
        disabled={false}
      />
    </div>
  );
};
export { PregameLobbyView };
