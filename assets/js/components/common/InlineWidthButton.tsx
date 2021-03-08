import React from "react";

interface InlineWidthButtonProps {
  children?: any;
  callback: Function;
}
const InlineWidthButton: React.FC<InlineWidthButtonProps> = ({
  children,
  callback,
}) => {
  return (
    <div
      onClick={() => callback()}
      className="styled_button inline_half_button relative_anchor"
    >
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { InlineWidthButton };
