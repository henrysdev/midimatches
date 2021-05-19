import React from "react";

import { BackButton } from ".";

interface FixedLeftBackButtonProps {
  callback: Function;
  buttonText?: string;
  extraStyles?: any;
}
const FixedLeftBackButton: React.FC<FixedLeftBackButtonProps> = ({
  callback,
  buttonText = "< BACK",
  extraStyles = {},
}) => {
  return (
    <div style={{ position: "absolute" }}>
      <div
        style={{
          position: "relative",
          top: "-8px",
          left: "-8px",
          ...extraStyles,
        }}
      >
        <BackButton callback={() => callback()}>{buttonText}</BackButton>
      </div>
    </div>
  );
};
export { FixedLeftBackButton };
