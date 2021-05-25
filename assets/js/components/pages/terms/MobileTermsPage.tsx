import React from "react";
import { TermsPolicy } from ".";
import { FixedLeftBackButton } from "../../common";

const MobileTermsPolicyPage: React.FC = () => {
  return (
    <div className="mobile_placeholder outset_3d_border_deep">
      <FixedLeftBackButton
        buttonText="< EXIT"
        callback={() => (window.location.href = "/about")}
      />
      <h3 className="mobile_title centered_title">
        <span className="accent_bars">///</span>TERMS
      </h3>
      <TermsPolicy />
    </div>
  );
};
export { MobileTermsPolicyPage };
