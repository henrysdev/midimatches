import React from "react";

import { MediumLargeTitle, MediumTitle, ComputerFrame } from "../../../common";
import { GameLeftPane } from ".";

interface InGameFrameProps {
  title: string;
  subtitle?: any;
  children: any;
}

const InGameFrame: React.FC<InGameFrameProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <ComputerFrame>
      <div style={{ padding: "8px" }}>
        <MediumLargeTitle centered={false}>{title}</MediumLargeTitle>
        {!!subtitle ? (
          <MediumTitle centered={false}>{subtitle}</MediumTitle>
        ) : (
          <></>
        )}
        <div className="in_game_content_flex_anchor">
          <div className="game_left_content_pane_wrapper">{children[0]}</div>
          <div className="gameplay_pane_wrapper">
            <div className="gameplay_pane inset_3d_border_deep inline_screen">
              <div className="gameplay_pane_inner">{children[1]}</div>
            </div>
          </div>
        </div>
      </div>
    </ComputerFrame>
  );
};
export { InGameFrame };
