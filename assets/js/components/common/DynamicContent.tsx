import React from "react";

interface DynamicContentProps {
  children?: any;
  style?: Object;
  centeredStyles?: Object;
}
const DynamicContent: React.FC<DynamicContentProps> = ({
  children,
  style,
  centeredStyles = {},
}) => {
  return (
    <div
      className="dynamic_content_container relative_anchor"
      style={!!style ? style : {}}
    >
      <div
        className="centered_div"
        style={{ width: "100%", ...centeredStyles }}
      >
        {children}
      </div>
    </div>
  );
};
export { DynamicContent };
