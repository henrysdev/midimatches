import React, { useEffect, useState } from "react";

import { MediumLargeTitle, ComputerButton } from "../../common";
import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "../";

const MenuPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <br />
        <MediumLargeTitle>
          <span className="accent_bars">///</span>PLAYER MENU
        </MediumLargeTitle>
        <div className="main_menu_btn_group">
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => (window.location.href = "/rooms")}
              extraClasses={["register_button"]}
            >
              PLAY ONLINE
            </ComputerButton>
          </div>
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => (window.location.href = "/practice")}
              extraClasses={["register_button"]}
            >
              SOLO PRACTICE
            </ComputerButton>
          </div>
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => (window.location.href = "/account")}
              extraClasses={["register_button"]}
            >
              ACCOUNT
            </ComputerButton>
          </div>
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => (window.location.href = "/about")}
              extraClasses={["register_button"]}
            >
              HELP
            </ComputerButton>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
export { MenuPage };
