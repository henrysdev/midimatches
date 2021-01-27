import React from "react";
import { useGameContext } from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { musicians } = useGameContext();
  return (
    <div className="game_layout uk-background-muted">
      <div className="left_sidebar">
        <Scoreboard musicianIds={musicians} />
        <div className="settings_box">
          <h4 className="uk-heading-divider uk-text-center">
            <span>Statistics</span>
          </h4>
        </div>
      </div>
      <div className="game_content_container uk-background-default">
        {children}
      </div>
    </div>
  );
};
export { GameLayout };
