import React from "react";

import { BackButton } from ".";

interface FixedLeftBackButtonProps {
  callback: Function;
  buttonText?: string;
}
const FixedLeftBackButton: React.FC<FixedLeftBackButtonProps> = ({
  callback,
  buttonText = "< BACK",
}) => {
  return (
    <div style={{ position: "absolute" }}>
      <div style={{ position: "relative", top: "-8px", left: "-8px" }}>
        <BackButton callback={() => callback()}>{buttonText}</BackButton>
      </div>
    </div>
  );
};
export { FixedLeftBackButton };
