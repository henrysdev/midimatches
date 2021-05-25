import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { HowToPlay } from ".";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";

const AboutPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="about_page_content">
          <div>
            <MediumLargeTitle centered={false}>
              <span className="accent_bars">///</span>ABOUT
            </MediumLargeTitle>
            <HowToPlay />
            <div className="about_page_play_button_container">
              <ComputerButton callback={() => (window.location.href = "/menu")}>
                LET'S PLAY!
              </ComputerButton>
            </div>
          </div>
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { AboutPage };
