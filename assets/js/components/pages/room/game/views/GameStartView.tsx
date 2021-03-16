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
import {
  useGameRulesContext,
  useViewDeadlineContext,
  useClockOffsetContext,
} from "../../../../../hooks";
import { calcMsUntilMsTimestamp } from "../../../../../utils";

interface GameStartViewProps {
  pushMessageToChannel: Function;
}

const GameStartView: React.FC<GameStartViewProps> = ({
  pushMessageToChannel,
}) => {
  const {
    gameRules: {
      viewTimeouts: { gameStart: gameStartTimeout },
    },
  } = useGameRulesContext();

  const { viewDeadline } = useViewDeadlineContext();
  const { clockOffset } = useClockOffsetContext();

  return (
    <div className="view_container">
      <MediumLargeTitle title="STARTING GAME" />
      <DynamicContent>
        <div className="uk" style={{ margin: "auto", maxWidth: "400px" }}>
          <Instructions
            description="Welcome! Make sure your MIDI inputs are connected. You will be able to play with your computer 
keyboard and mouse as well."
          />
          <Instructions description="Sit back relax and get ready for play! The first round will begin shortly." />
        </div>
      </DynamicContent>
      <TimerBox>
        {!!gameStartTimeout ? (
          <Timer
            descriptionText={"First round starts in "}
            duration={calcMsUntilMsTimestamp(viewDeadline) + clockOffset}
          />
        ) : (
          <></>
        )}
      </TimerBox>
    </div>
  );
};
export { GameStartView };
