import React from "react";

interface FullWidthButtonProps {
  label: string;
  callback: Function;
  disabled?: boolean;
}
const FullWidthButton: React.FC<FullWidthButtonProps> = ({
  disabled = false,
  label,
  callback,
}) => {
  return (
    <button
      style={{ width: "100%", marginTop: "8px" }}
      className="uk-button uk-button-primary"
      disabled={disabled}
      onClick={() => callback()}
    >
      {label}
    </button>
  );
};
export { FullWidthButton };
