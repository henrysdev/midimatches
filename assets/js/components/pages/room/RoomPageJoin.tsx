import React from "react";

import { MediumLargeTitle, ComputerButton } from "../../common";

interface RoomPageJoinProps {
  setHasJoinedRoom: Function;
  setIsAudienceMember: Function;
}
const RoomPageJoin: React.FC<RoomPageJoinProps> = ({
  setHasJoinedRoom,
  setIsAudienceMember,
}) => {
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
              setIsAudienceMember(false);
              setHasJoinedRoom(true);
            }}
            extraClasses={["register_button"]}
          >
            I WANT TO PLAY!
          </ComputerButton>
        </div>
        <div className="main_menu_btn">
          <ComputerButton
            callback={() => {
              setIsAudienceMember(true);
              setHasJoinedRoom(true);
            }}
            extraClasses={["register_button"]}
          >
            I JUST WANT TO SPECTATE!
          </ComputerButton>
        </div>
      </div>
    </div>
  );
};
export { RoomPageJoin };
