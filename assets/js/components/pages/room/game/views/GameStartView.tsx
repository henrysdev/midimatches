import React from "react";
import { SimpleButton, Instructions } from "../../../../common/index";
import { SUBMIT_READY_UP_EVENT } from "../../../../../constants/index";

interface GameStartViewProps {
  pushMessageToChannel: Function;
}

const desc = `
Welcome! Make sure you have a MIDI keyboard connected
`;

const GameStartView: React.FC<GameStartViewProps> = ({
  pushMessageToChannel,
}) => {
  return (
    <div>
      <Instructions title="Starting Game" description={desc}>
        <SimpleButton
          label="Ready Up"
          callback={() => {
            pushMessageToChannel(SUBMIT_READY_UP_EVENT, {});
          }}
          disabled={false}
        />
      </Instructions>
    </div>
  );
};
export { GameStartView };
