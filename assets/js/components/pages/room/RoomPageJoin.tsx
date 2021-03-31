import React from "react";

import {
  MediumLargeTitle,
  ComputerButton,
  Modal,
  CenteredFrontWindow,
} from "../../common";

interface RoomPageJoinProps {
  roomId: string;
}
const RoomPageJoin: React.FC<RoomPageJoinProps> = ({ roomId }) => {
  return (
    <CenteredFrontWindow>
      <br />
      <MediumLargeTitle>JOIN ROOM AS A...</MediumLargeTitle>

      <div className="main_menu_btn_group">
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => {
              window.location.href = `/room/${roomId}/play`;
            }}
            extraClasses={["register_button"]}
            extraStyles={{ margin: 8 }}
          >
            PLAYER
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => {
              window.location.href = `/room/${roomId}/watch`;
            }}
            extraClasses={["register_button"]}
            extraStyles={{ margin: 8 }}
          >
            AUDIENCE MEMBER
          </ComputerButton>
        </div>
      </div>
      <div
        className="inset_3d_border_shallow inline_screen"
        style={{ padding: "8px", margin: "8px" }}
      >
        <p>
          Note: <strong>Audience Member</strong> capabilities are limited to
          voting and chat.
        </p>
      </div>
    </CenteredFrontWindow>
  );
};
export { RoomPageJoin };
