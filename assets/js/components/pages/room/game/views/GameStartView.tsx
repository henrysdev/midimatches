import React from "react";
import {
  SimpleButton,
  Instructions,
  Title,
  DynamicContent,
} from "../../../../common/index";
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
      <Title title="Starting Game" />
      <DynamicContent>
        <SimpleButton
          label="Ready Up"
          callback={() => {
            pushMessageToChannel(SUBMIT_READY_UP_EVENT, {});
          }}
          disabled={false}
        />
      </DynamicContent>
      <Instructions description={desc}></Instructions>
    </div>
  );
};
export { GameStartView };
