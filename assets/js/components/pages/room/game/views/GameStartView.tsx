import React, { useState } from "react";
import {
  FullWidthButton,
  Instructions,
  Title,
  DynamicContent,
} from "../../../../common/index";
import { SUBMIT_READY_UP_EVENT } from "../../../../../constants/index";
import { MidiConfiguration } from "../../../../audio";

interface GameStartViewProps {
  pushMessageToChannel: Function;
  setMidiInputs: Function;
}

const metaInstructions = `
Down here you will find help and instructions at each
step of the game. Feel free to collapse this pane once you get the hang of 
the gameplay.
`;

const GameStartView: React.FC<GameStartViewProps> = ({
  pushMessageToChannel,
  setMidiInputs,
}) => {
  const [isReady, setIsReady] = useState<boolean>(false);

  return (
    <div>
      <Title title="MIDI Setup" />
      <DynamicContent>
        {isReady ? (
          <div>
            Get ready for play! The first round will begin as soon as everyone
            is ready
          </div>
        ) : (
          <div>
            <MidiConfiguration setMidiInputs={setMidiInputs} />
            <FullWidthButton
              label="Ready Up"
              callback={() => {
                pushMessageToChannel(SUBMIT_READY_UP_EVENT, {});
                setIsReady(true);
              }}
              disabled={false}
            />
          </div>
        )}
      </DynamicContent>
      <Instructions description={metaInstructions}>
        <p>
          To test or configure the connection to your MIDI input device, click
          the "Configure MIDI" button.
        </p>
        <p>
          Once you are ready to start, click the "Ready Up" button.
          <strong>
            The game will begin within a minute, or as soon as everyone has
            ready'd up.{" "}
          </strong>
        </p>
      </Instructions>
    </div>
  );
};
export { GameStartView };
