import React, { useEffect, useState } from "react";
import {
  ContentButton,
  Instructions,
  MediumLargeTitle,
  DynamicContent,
  Timer,
  TimerBox,
} from "../../../../common";
import { SUBMIT_READY_UP_EVENT } from "../../../../../constants/index";
import { MidiConfiguration } from "../../../../audio";
import { useGameContext } from "../../../../../hooks";

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
  const {
    gameRules: {
      viewTimeouts: { gameStart: gameStartTimeout },
    },
  } = useGameContext();

  return (
    <div>
      <MediumLargeTitle title="STARTING GAME" />
      <DynamicContent>
        {isReady ? (
          <Instructions
            description="Get ready for play! The first round will begin as soon as everyone
          is ready"
          />
        ) : (
          <div className="uk" style={{ margin: "auto", maxWidth: "400px" }}>
            <Instructions
              description={
                "Confirm your MIDI input(s). You will be able to play with your computer keyboard and mouse as well."
              }
            />
            <MidiConfiguration setMidiInputs={setMidiInputs} />
            <ContentButton
              callback={() => {
                const sentMessage = pushMessageToChannel(
                  SUBMIT_READY_UP_EVENT,
                  {}
                );
                if (!!sentMessage) {
                  sentMessage
                    .receive("ok", (_reply: any) => {
                      console.log("ready up successful");
                      setIsReady(true);
                    })
                    .receive("ready up error", (err: any) => {
                      console.error(err);
                    });
                }
              }}
            >
              <h4 className="roboto_font">READY UP</h4>
            </ContentButton>
          </div>
        )}
      </DynamicContent>
      <TimerBox>
        {!!gameStartTimeout ? (
          <Timer
            key={gameStartTimeout}
            descriptionText={"Game starts in "}
            duration={gameStartTimeout}
          />
        ) : (
          <></>
        )}
      </TimerBox>
      {/* <Instructions description={metaInstructions}>
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
      </Instructions> */}
    </div>
  );
};
export { GameStartView };
