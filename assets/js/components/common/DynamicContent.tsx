import React from "react";

interface DynamicContentProps {
  children?: any;
  style?: Object;
}
const DynamicContent: React.FC<DynamicContentProps> = ({ children, style }) => {
  return (
    <div
      className="dynamic_content_container relative_anchor"
      style={!!style ? style : {}}
    >
      <div className="centered_div" style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
};
export { DynamicContent };
