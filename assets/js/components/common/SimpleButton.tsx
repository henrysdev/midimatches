import React from "react";

interface SimpleButtonProps {
  label: string;
  callback: Function;
  disabled: boolean;
}
const SimpleButton: React.FC<SimpleButtonProps> = ({
  disabled,
  label,
  callback,
}) => {
  return (
    <button
      className="uk-button uk-button-default"
      disabled={disabled}
      onClick={() => callback()}
    >
      {label}
    </button>
  );
};
export { SimpleButton };
