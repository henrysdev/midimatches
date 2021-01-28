import React from "react";

interface DynamicContentProps {
  children?: any;
}
const DynamicContent: React.FC<DynamicContentProps> = ({ children }) => {
  return (
    <div className="game_content_dynamic uk-card uk-card-small uk-card-default uk-card-body">
      {children}
    </div>
  );
};
export { DynamicContent };
