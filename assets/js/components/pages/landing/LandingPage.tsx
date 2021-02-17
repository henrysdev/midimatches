import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { HowToPlay } from ".";

const LandingPage: React.FC = () => {
  return (
    <ComputerFrame>
      <div className="landing_page_content">
        <div>
          <MediumLargeTitle centered={false}>///MIDI MATCHES</MediumLargeTitle>
          <HowToPlay />
          <ComputerButton callback={() => (window.location.href = "/servers")}>
            <h5>LET'S PLAY!</h5>
          </ComputerButton>
        </div>
      </div>
    </ComputerFrame>
  );
};
export { LandingPage };
