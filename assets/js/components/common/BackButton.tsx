import React from "react";

import { SmallButton } from ".";

interface BackButtonProps {
  children?: any;
  callback: Function;
  extraClasses?: string[];
  extraStyles?: any;
}
const BackButton: React.FC<BackButtonProps> = ({
  children,
  callback,
  extraClasses = [],
  extraStyles = {},
}) => {
  return (
    <div className="back_button_wrapper">
      <SmallButton
        callback={callback}
        extraStyles={extraStyles}
        extraClasses={extraClasses}
      >
        {children}
      </SmallButton>
    </div>
  );
};
export { BackButton };
