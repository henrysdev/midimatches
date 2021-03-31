import React from "react";

import { MediumLargeTitle, ComputerButton } from "../../common";

interface RoomPageJoinProps {
  roomId: string;
}
const RoomPageJoin: React.FC<RoomPageJoinProps> = ({ roomId }) => {
  return (
    <div className="computer_frame outset_3d_border_deep">
      <br />
      <MediumLargeTitle>
        <span className="accent_bars">///</span>JOINING ROOM...
      </MediumLargeTitle>
      <div className="main_menu_btn_group">
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => {
              window.location.href = `/room/${roomId}/play`;
            }}
            extraClasses={["register_button"]}
          >
            I WANT TO PLAY!
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => {
              window.location.href = `/room/${roomId}/watch`;
            }}
            extraClasses={["register_button"]}
          >
            I JUST WANT TO WATCH!
          </ComputerButton>
        </div>
      </div>
    </div>
  );
};
export { RoomPageJoin };
