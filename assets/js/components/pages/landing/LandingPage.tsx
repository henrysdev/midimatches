import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { HowToPlay } from ".";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "../";

const LandingPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="landing_page_content">
          <div>
            <MediumLargeTitle centered={false}>
              <span className="accent_bars">///</span>WELCOME
            </MediumLargeTitle>
            <HowToPlay />
            <ComputerButton callback={() => (window.location.href = "/menu")}>
              LET'S PLAY!
            </ComputerButton>
          </div>
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { LandingPage };
