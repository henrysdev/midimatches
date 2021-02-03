import React from "react";

interface DynamicContentProps {
  children?: any;
  style?: Object;
}
const DynamicContent: React.FC<DynamicContentProps> = ({ children, style }) => {
  return (
    <div
      style={{
        ...style,
        padding: "8px",
        color: "#666",
        marginBottom: "8px",
        minHeight: "300px",
      }}
    >
      {children}
    </div>
  );
};
export { DynamicContent };
