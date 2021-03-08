import React, { memo } from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";

interface TimerBoxProps {
  children?: any;
}
const TimerBox: React.FC<TimerBoxProps> = memo(({ children }) => {
  return (
    <div className="timer_box_anchor">
      <div className="timer_box_wrapper outset_3d_border_shallow">
        <div className="timer_box inset_3d_border_shallow">
          <div className="timer_box_inner">{children}</div>
        </div>
      </div>
    </div>
  );
});
export { TimerBox };
