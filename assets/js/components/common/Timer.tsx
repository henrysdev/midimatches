import React, { memo } from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";
import { MediumTitle } from "../common";
import { currUtcTimestamp } from "../../utils";

interface TimerProps {
  duration: Milliseconds;
  descriptionText?: string;
  timesUpText?: string;
  style?: Object;
  extremeText?: boolean;
}
const Timer: React.FC<TimerProps> = memo(
  ({
    duration,
    descriptionText,
    timesUpText,
    extremeText = false,
    style: extraStyles = {},
  }) => {
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
          <p style={timeLeft <= 5 ? { color: "red" } : extraStyles}>
            {!!descriptionText ? <span>{descriptionText}</span> : <></>}{" "}
            <span
              className={
                extremeText && timeLeft <= 5 ? "extreme_countdown_text" : ""
              }
            >
              {timeLeft}
            </span>
          </p>
        );
      }
    };

    return (
      <div className="gameplay_timer">
        <MediumTitle>
          <Countdown date={currUtcTimestamp() + duration} renderer={renderer} />
        </MediumTitle>
      </div>
    );
  }
);
export { Timer };
