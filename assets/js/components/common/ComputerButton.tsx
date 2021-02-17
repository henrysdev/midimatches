import React, { useState } from "react";

interface ComputerButtonProps {
  children?: any;
  callback: Function;
  fullwidth?: boolean;
}
const ComputerButton: React.FC<ComputerButtonProps> = ({
  children,
  callback,
  fullwidth = false,
}) => {
  const [lightBulbAnimClass, setLightBulbAnimClass] = useState<string>(
    "led-green"
  );
  return (
    <div
      onMouseEnter={() => setLightBulbAnimClass("led-green bulb-on-green")}
      onMouseLeave={() => setLightBulbAnimClass("led-green bulb-off-green")}
      onClick={() => callback()}
      className="banner_button relative_anchor"
      style={
        fullwidth
          ? { marginLeft: 0, marginRight: 0, width: "calc(100% - 16px)" }
          : {}
      }
    >
      <div className="led-box" style={{ float: "left" }}>
        <div className={lightBulbAnimClass}></div>
      </div>
      <div className="centered_div">{children}</div>
      <div className="led-box" style={{ float: "right" }}>
        <div className={lightBulbAnimClass}></div>
      </div>
    </div>
  );
};
export { ComputerButton };
