import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { HowToPlay } from ".";

const LandingPage: React.FC = () => {
  return (
    <ComputerFrame>
      <div className="landing_page_content">
        <div>
          <MediumLargeTitle centered={false}>
            <span className="accent_bars">///</span>WELCOME
          </MediumLargeTitle>
          <HowToPlay />
          <ComputerButton callback={() => (window.location.href = "/menu")}>
            <h5>LET'S PLAY!</h5>
          </ComputerButton>
        </div>
      </div>
    </ComputerFrame>
  );
};
export { LandingPage };
