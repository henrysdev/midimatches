import React from "react";

import { MediumLargeTitle, MediumTitle } from "../../../common";
import { GameLeftPane } from ".";
import { useGameContext } from "../../../../hooks";

const gameMode = "FREE-FOR-ALL";

interface InGameFrameProps {
  children?: any;
  roomName: string;
}

const InGameFrame: React.FC<InGameFrameProps> = ({ children, roomName }) => {
  const { roundNum } = useGameContext();
  return (
    <div className="computer_frame outset_3d_border_deep">
      <div>
        <MediumLargeTitle centered={false}>///IN GAME</MediumLargeTitle>
        <MediumTitle centered={false}>{`${roomName} / ${gameMode} ${
          !!roundNum ? `/ ROUND ${roundNum}` : ""
        }`}</MediumTitle>
        <div className="in_game_content_flex_anchor">
          <div className="game_left_content_pane_wrapper">
            <GameLeftPane />
          </div>
          <div className="gameplay_pane_wrapper">
            <div className="gameplay_pane inset_3d_border_deep inline_screen">
              <div className="gameplay_pane_inner">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export { InGameFrame };
