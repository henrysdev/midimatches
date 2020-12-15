import React, { useContext, useState } from "react";
import { SimpleButton } from "../../common/index";
import { SUBMIT_READY_UP_EVENT } from "../../../constants/index";
import { GameContext } from "../../../contexts/index";

interface GameStartViewProps {
  submitReadyUp: Function;
}

const GameStartView: React.FC<GameStartViewProps> = ({ submitReadyUp }) => {
  return (
    <div>
      <h3>GameStart View</h3>
      <SimpleButton
        label="Ready Up"
        callback={() => {
          submitReadyUp(SUBMIT_READY_UP_EVENT, {});
        }}
        disabled={false}
      />
    </div>
  );
};
export { GameStartView };
