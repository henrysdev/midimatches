import React from "react";
import { MaterialIcon } from ".";

interface ArrowButtonProps {
  callback: Function;
  left?: boolean;
  styles?: any;
  hidden?: boolean;
}
const ArrowButton: React.FC<ArrowButtonProps> = ({
  callback,
  left = true,
  styles = {},
  hidden = false,
}) => {
  return (
    <div
      className={hidden ? "hidden_div" : "sample_selection_button"}
      style={styles}
      onClick={() => callback()}
    >
      <MaterialIcon
        iconName={left ? "keyboard_arrow_left" : "keyboard_arrow_right"}
        style={{
          textAlign: "center",
          fontSize: "26px",
        }}
      />
    </div>
  );
};
export { ArrowButton };
