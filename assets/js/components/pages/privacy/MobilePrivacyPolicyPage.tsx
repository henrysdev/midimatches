import React from "react";
import { PrivacyPolicy } from ".";

const MobilePrivacyPolicyPage: React.FC = () => {
  return (
    <div className="mobile_placeholder outset_3d_border_deep">
      <h1 className="mobile_title centered_title">
        <span className="accent_bars">///</span>PRIVACY
      </h1>
      <PrivacyPolicy />
      <div className="warning_alert roboto_font">
        <strong>Note: </strong> Midi Matches is not currently supported on
        mobile devices. Please switch to a desktop browser to continue.
      </div>
    </div>
  );
};
export { MobilePrivacyPolicyPage };
