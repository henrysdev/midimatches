import React from "react";

import { GameLeftPane } from ".";

interface InGameFrameProps {
  children?: any;
}
const InGameFrame: React.FC<InGameFrameProps> = ({ children }) => {
  return (
    <div className="computer_frame outset_3d_border_deep">
      <div>
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
