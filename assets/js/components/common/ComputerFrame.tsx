import React from "react";

interface ComputerFrameProps {
  children?: any;
}
const ComputerFrame: React.FC<ComputerFrameProps> = ({ children }) => {
  return (
    <div className="computer_frame">
      <div className="frame_bevel">{children}</div>
    </div>
  );
};
export { ComputerFrame };
