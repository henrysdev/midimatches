import React, { useState, useMemo, useEffect } from "react";

import * as Tone from "tone";

const defaultClasses = ["banner_button", "relative_anchor"];

interface ComputerButtonProps {
  children?: any;
  callback: Function;
  extraClasses?: string[];
}
const ComputerButton: React.FC<ComputerButtonProps> = ({
  children,
  callback,
  extraClasses = [],
}) => {
  const [lightBulbAnimClass, setLightBulbAnimClass] = useState<string>(
    "led-green"
  );
  const className = useMemo(() => {
    return [...defaultClasses, ...extraClasses].join(" ");
  }, [extraClasses]);
  return (
    <div
      onMouseEnter={() => setLightBulbAnimClass("led-green bulb-on-green")}
      onMouseLeave={() => setLightBulbAnimClass("led-green bulb-off-green")}
      onClick={() => {
        const audioNode = new Audio("../soundeffects/button_click.mp3");
        audioNode.volume = 0.4;
        audioNode.play();
        callback();
      }}
      className={className}
    >
      <div className="led-box" style={{ float: "left" }}>
        <div className={lightBulbAnimClass}></div>
      </div>
      <div className="centered_div">
        <div className="computer_button_text">{children}</div>
      </div>
    </div>
  );
};
export { ComputerButton };
