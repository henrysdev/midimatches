import React from "react";

interface DynamicContentProps {
  children?: any;
  style?: Object;
}
const DynamicContent: React.FC<DynamicContentProps> = ({ children, style }) => {
  return (
    <div
      className="uk-card uk-card-small uk-card-default uk-card-body"
      style={{
        ...style,
        marginBottom: "8px",
        minHeight: "300px",
      }}
    >
      {children}
    </div>
  );
};
export { DynamicContent };
