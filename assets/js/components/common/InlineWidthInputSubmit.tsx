import React from "react";

interface InlineWidthInputSubmitProps {
  disabled?: boolean;
  label: string;
}
const InlineWidthInputSubmit: React.FC<InlineWidthInputSubmitProps> = ({
  disabled = false,
  label,
}) => {
  return (
    <input
      className="inline_width_input_submit roboto_font"
      disabled={disabled}
      type="submit"
      value={label}
    />
  );
};
export { InlineWidthInputSubmit };
