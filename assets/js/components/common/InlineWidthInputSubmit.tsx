import React from "react";

interface InlineWidthInputSubmitProps {
  disabled?: boolean;
  label: string;
  extraStyles?: any;
}
const InlineWidthInputSubmit: React.FC<InlineWidthInputSubmitProps> = ({
  disabled = false,
  label,
  extraStyles = {},
}) => {
  return (
    <input
      className="styled_button inline_width_input_submit roboto_font"
      style={extraStyles}
      disabled={disabled}
      type="submit"
      value={label}
    />
  );
};
export { InlineWidthInputSubmit };
