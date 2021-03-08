import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../../types";
import {
  SERVERLIST_UPDATE_EVENT,
  MAX_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_ALIAS_LENGTH,
} from "../../../constants";
import {
  FullWidthButton,
  MediumLargeTitle,
  ComputerButton,
} from "../../common";

const MenuPage: React.FC = () => {
  return (
    <div className="narrow_center_container computer_frame outset_3d_border_deep">
      <br />
      <MediumLargeTitle>///MIDI MATCHES</MediumLargeTitle>
      <div className="main_menu_btn_group">
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => (window.location.href = "/rooms")}
            extraClasses={["register_button"]}
          >
            <h5>PLAY ONLINE</h5>
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => (window.location.href = "/practice")}
            extraClasses={["register_button"]}
          >
            <h5>SOLO PRACTICE</h5>
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => (window.location.href = "/register")}
            extraClasses={["register_button"]}
          >
            <h5>CHANGE ALIAS</h5>
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => (window.location.href = "/")}
            extraClasses={["register_button"]}
          >
            <h5>ABOUT</h5>
          </ComputerButton>
        </div>
      </div>
    </div>
  );
};
export { MenuPage };
