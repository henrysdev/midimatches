import React from "react";

import { HowToPlay } from "./components/pages/landing";
import { ComputerFrame } from "./components/common";

const MobilePlaceholder: React.FC = () => {
  return (
    <div>
      <div
        className="mobile_placeholder outset_3d_border_deep"
        style={{ borderRadius: "10px", backgroundColor: "#ebdfce" }}
      >
        <h1 className="mobile_title centered_title">
          <span className="accent_bars">///</span>WELCOME
        </h1>
        <HowToPlay />
        <div className="warning_alert roboto_font">
          <strong>Note: </strong> MIDI Matches is not supported on mobile
          browsers. Please switch to a desktop browser to continue to game.
        </div>
      </div>
    </div>
  );
};
export { MobilePlaceholder };
