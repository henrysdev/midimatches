import React, { useMemo } from "react";

interface InlineWidthButtonProps {
  children?: any;
  callback: Function;
  disabled?: boolean;
  styles?: any;
}
const InlineWidthButton: React.FC<InlineWidthButtonProps> = ({
  children,
  callback,
  disabled = false,
  styles = {},
}) => {
  return disabled ? (
    <div
      className="styled_button_disabled inline_half_button relative_anchor"
      style={styles}
    >
      <div className="centered_div">{children}</div>
    </div>
  ) : (
    <div
      onClick={() => callback()}
      className="styled_button inline_half_button relative_anchor"
      style={styles}
    >
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { InlineWidthButton };
