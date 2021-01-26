import React from "react";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="game_layout">
      <div className="left_sidebar">
        <div className="players_box">Players</div>
        <div className="settings_box">Settings</div>
      </div>
      <div className="game_content_container">{children}</div>
    </div>
  );
};
export { GameLayout };
