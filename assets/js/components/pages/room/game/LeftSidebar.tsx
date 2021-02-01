import React from "react";

interface LeftSidebarProps {
  children?: any;
}
const LeftSidebar: React.FC<LeftSidebarProps> = ({ children }) => {
  return <div className="left_sidebar">{children}</div>;
};
export { LeftSidebar };
