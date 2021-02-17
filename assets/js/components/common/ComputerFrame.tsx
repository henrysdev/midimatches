import React from "react";

interface ComputerFrameProps {
  children?: any;
}
const ComputerFrame: React.FC<ComputerFrameProps> = ({ children }) => {
  return (
    <div className="computer_frame outset_3d_border_deep">
      <div>{children}</div>
    </div>
  );
};
export { ComputerFrame };
