import React from "react";
import { TermsPolicy } from ".";

const MobileTermsPolicyPage: React.FC = () => {
  return (
    <div className="mobile_placeholder outset_3d_border_deep">
      <h1 className="mobile_title centered_title">
        <span className="accent_bars">///</span>TERMS OF SERVICE
      </h1>
      <TermsPolicy />
      <div className="warning_alert roboto_font">
        <strong>Note: </strong> Midi Matches is not currently supported on
        mobile devices. Please switch to a desktop browser to continue.
      </div>
    </div>
  );
};
export { MobileTermsPolicyPage };
