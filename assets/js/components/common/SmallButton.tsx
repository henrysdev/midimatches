import React, { useState, useMemo, useEffect } from "react";

const defaultClasses = ["small_button", "relative_anchor"];

interface SmallButtonProps {
  children?: any;
  callback: Function;
  extraClasses?: string[];
  extraStyles?: any;
}
const SmallButton: React.FC<SmallButtonProps> = ({
  children,
  callback,
  extraClasses = [],
  extraStyles = {},
}) => {
  const className = useMemo(() => {
    return [...defaultClasses, ...extraClasses].join(" ");
  }, [extraClasses]);
  return (
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
  );
};
export { SmallButton };
