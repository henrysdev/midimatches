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
        return <p>{timesUpText}</p>;
      } else {
        // Render a countdown
        const timeLeft = seconds + minutes * 60;
        return (
          <p style={timeLeft <= 5 ? { color: "red" } : {}}>
            {!!descriptionText ? <span>{descriptionText}</span> : <></>}{" "}
            <span>{timeLeft}</span>
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
