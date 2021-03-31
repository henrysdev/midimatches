import React from "react";

import { MediumLargeTitle, MediumTitle, ComputerFrame } from "../../../common";
import { GameLeftPane } from ".";

interface InGameFrameProps {
  title: string;
  subtitle?: any;
  textRight?: string;
  textRightClass?: string;
  children: any;
}

const InGameFrame: React.FC<InGameFrameProps> = ({
  children,
  title,
  subtitle,
  textRight,
  textRightClass = "",
}) => {
  return (
    <ComputerFrame>
      <div style={{ padding: "8px", height: "calc(100% - 16px)" }}>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6, float: "left" }}>
            <MediumLargeTitle centered={false}>
              <span className="accent_bars">///</span>
              {title}
            </MediumLargeTitle>
            {!!subtitle ? (
              <MediumTitle centered={false}>{subtitle}</MediumTitle>
            ) : (
              <></>
            )}
          </div>
          {!!textRight ? (
            <div style={{ flex: 1, float: "right", textAlign: "right" }}>
              <h2 className={textRightClass}>
                <strong>{textRight}</strong>
              </h2>
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className="in_game_content_flex_anchor">
          {children[0]}
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
