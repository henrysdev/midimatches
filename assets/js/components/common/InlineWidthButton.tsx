import React, { useMemo } from "react";

interface InlineWidthButtonProps {
  children?: any;
  callback: Function;
  disabled?: boolean;
}
const InlineWidthButton: React.FC<InlineWidthButtonProps> = ({
  children,
  callback,
  disabled = false,
}) => {
  return disabled ? (
    <div className="styled_button_disabled inline_half_button relative_anchor">
      <div className="centered_div">{children}</div>
    </div>
  ) : (
    <div
      onClick={() => callback()}
      className="styled_button inline_half_button relative_anchor"
    >
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { InlineWidthButton };
