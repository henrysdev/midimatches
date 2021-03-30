import React from "react";

import { HowToPlay } from ".";

const MobileAboutPage: React.FC = () => {
  return (
    <div>
      <div className="mobile_placeholder outset_3d_border_deep">
        <h1 className="mobile_title centered_title">
          <span className="accent_bars">///</span>ABOUT
        </h1>
        <HowToPlay />
        <div className="warning_alert roboto_font">
          <strong>Note: </strong> Midi Matches is not currently supported on
          mobile devices. Please switch to a desktop browser to continue.
        </div>
      </div>
    </div>
  );
};
export { MobileAboutPage };
