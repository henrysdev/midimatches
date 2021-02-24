import React from "react";

interface PageContentProps {
  children?: any;
}
const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return <div className="page_content">{children}</div>;
};
export { PageContent };
