import React from "react";

import { LeftSidebar } from "./";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="game_layout uk-background-muted">
      <LeftSidebar />
      <div className="game_content_container uk-background-default">
        {children}
      </div>
    </div>
  );
};
export { GameLayout };
