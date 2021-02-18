import React, { memo } from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";
import { MediumTitle } from "../common";

interface TimerProps {
  duration: Milliseconds;
  descriptionText?: string;
  timesUpText?: string;
  style?: Object;
}
const Timer: React.FC<TimerProps> = memo(
  ({ duration, descriptionText, timesUpText, style }) => {
    // Renderer callback with condition
    const renderer = ({
      minutes,
      seconds,
      completed,
    }: {
      minutes: number;
      seconds: number;
      completed: boolean;
    }) => {
      if (completed) {
        // Render a completed state
        return <div>{timesUpText}</div>;
      } else {
        // Render a countdown
        return (
          <p>
            {!!descriptionText ? <span>{descriptionText}</span> : <></>}{" "}
            <span>{seconds + minutes * 60}</span>
          </p>
        );
      }
    };

    return (
      <div className="gameplay_timer">
        <MediumTitle>
          <Countdown date={Date.now() + duration} renderer={renderer} />
        </MediumTitle>
      </div>
    );
  }
);
export { Timer };
