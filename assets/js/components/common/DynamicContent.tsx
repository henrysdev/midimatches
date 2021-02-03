import React from "react";

interface DynamicContentProps {
  children?: any;
  style?: Object;
}
const DynamicContent: React.FC<DynamicContentProps> = ({ children, style }) => {
  return (
    <div
      className="game_content_dynamic uk-card uk-card-small uk-card-default uk-card-body"
      style={style}
    >
      {children}
    </div>
  );
};
export { DynamicContent };
