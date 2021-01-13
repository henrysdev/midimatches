import React from "react";

interface DebugButtonProps {
  label: string;
  callback: Function;
}
const DebugButton: React.FC<DebugButtonProps> = ({ label, callback }) => {
  return (
    <button
      style={{ backgroundColor: "purple" }}
      disabled={false}
      onClick={() => callback()}
    >
      {label}
    </button>
  );
};
export { DebugButton };
