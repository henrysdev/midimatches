import React from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";

interface TimerProps {
  duration: Milliseconds;
  timesUpText: string;
}
const Timer: React.FC<TimerProps> = ({ duration, timesUpText }) => {
  return (
    <div>
      <Countdown date={Date.now() + duration}>
        <div>{timesUpText}</div>
      </Countdown>
    </div>
  );
};
export { Timer };
