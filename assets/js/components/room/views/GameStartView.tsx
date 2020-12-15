import React, { useContext, useState } from "react";
import { SimpleButton } from "../../common/index";
import { SUBMIT_READY_UP_EVENT } from "../../../constants/index";
import { GameContext } from "../../../contexts/index";

interface GameStartViewProps {
  pushMessageToChannel: Function;
}

const GameStartView: React.FC<GameStartViewProps> = ({
  pushMessageToChannel,
}) => {
  return (
    <div>
      <h3>GameStart View</h3>
      <SimpleButton
        label="Ready Up"
        callback={() => {
          pushMessageToChannel(SUBMIT_READY_UP_EVENT, {});
        }}
        disabled={false}
      />
    </div>
  );
};
export { GameStartView };
