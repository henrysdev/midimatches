import React, { useState, useMemo } from "react";

const defaultClasses = [
  "banner_button",
  "relative_anchor",
  "outset_3d_border_shallow",
];

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
      onClick={() => callback()}
      className={className}
    >
      <div className="led-box" style={{ float: "left" }}>
        <div className={lightBulbAnimClass}></div>
      </div>
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { ComputerButton };
