import React, { useState, useMemo, useEffect } from "react";

import * as Tone from "tone";

const defaultClasses = ["back_button", "relative_anchor"];

interface BackButtonProps {
  children?: any;
  callback: Function;
  extraClasses?: string[];
  extraStyles?: any;
}
const BackButton: React.FC<BackButtonProps> = ({
  children,
  callback,
  extraClasses = [],
  extraStyles = {},
}) => {
  const className = useMemo(() => {
    return [...defaultClasses, ...extraClasses].join(" ");
  }, [extraClasses]);
  return (
    <div className="back_button_wrapper">
      <div
        onClick={() => {
          const audioNode = new Audio("../soundeffects/button_click.mp3");
          audioNode.volume = 0.4;
          audioNode.play();
          callback();
        }}
        className={className}
        style={{ ...extraStyles }}
      >
        <div className="centered_div">
          <div className="computer_button_text">{children}</div>
        </div>
      </div>
    </div>
  );
};
export { BackButton };
