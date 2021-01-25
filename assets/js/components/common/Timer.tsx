import React from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";

interface TimerProps {
  duration: Milliseconds;
  descriptionText?: string;
  timesUpText?: string;
}
const Timer: React.FC<TimerProps> = ({
  duration,
  descriptionText,
  timesUpText,
}) => {
  return (
    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
      {!!descriptionText ? <span>{descriptionText}</span> : <></>}
      <Countdown date={Date.now() + duration}>
        <div>{!!timesUpText ? <span>{timesUpText}</span> : <></>}</div>
      </Countdown>
    </div>
  );
};
export { Timer };
