import React from "react";

import { LeftSidebar } from "./";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div
      className="uk-background-muted"
      style={{
        display: "flex",
        flexDirection: "row",
        maxHeight: "2000px",
        maxWidth: "2000px",
        padding: "8px",
        boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      <LeftSidebar />
      <div
        className="uk-background-default"
        style={{
          padding: "8px",
          flexGrow: 6,
        }}
      >
        {children}
      </div>
    </div>
  );
};
export { GameLayout };
