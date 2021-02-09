import React, { useState } from "react";

const disabledStyle = {
  color: "grey",
  backgroundColor: "rgb(0, 0, 0, .2)",
};

const defaultStyle = {
  cursor: "pointer",
  height: "100%",
  width: "100%",
  minHeight: "50px",
  border: "1px solid black",
  backgroundColor: "white",
};

interface ButtonProps {
  label: string;
  callback: Function;
  disabled?: boolean;
  style?: Object;
}
const Button: React.FC<ButtonProps> = ({
  disabled = false,
  label,
  callback,
  style,
}) => {
  const extraStyles = style ? style : {};
  const styles = disabled
    ? { ...defaultStyle, ...disabledStyle, ...extraStyles }
    : { ...defaultStyle, ...extraStyles };
  const [hovering, setHovering] = useState<boolean>(false);
  return (
    <div
      style={{
        position: "relative",
        ...styles,
        backgroundColor: hovering ? "#f8f8f8" : defaultStyle.backgroundColor,
      }}
      onClick={() => callback()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <p
        style={{
          position: "absolute",
          margin: 0,
          top: "50%",
          left: "50%",
          msTransform: "translate(-50%, -50%)",
          transform: "translate(-50%, -50%)",
        }}
      >
        {label}
      </p>
    </div>
  );
};
export { Button };
