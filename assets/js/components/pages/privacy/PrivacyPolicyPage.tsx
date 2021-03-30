import React from "react";
import { ComputerFrame, ComputerButton, MediumLargeTitle } from "../../common";
import { PrivacyPolicy } from ".";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";

const PrivacyPolicyPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="privacy_page_content">
          <MediumLargeTitle centered={false}>
            <span className="accent_bars">///</span>PRIVACY POLICY
          </MediumLargeTitle>
          <PrivacyPolicy />
          <div className="about_page_play_button_container">
            <ComputerButton callback={() => (window.location.href = "/menu")}>
              EXIT TO MENU
            </ComputerButton>
          </div>
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { PrivacyPolicyPage };
