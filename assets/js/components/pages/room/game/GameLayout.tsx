import React from "react";
import { useGameContext } from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { players, readyUps, roundNum } = useGameContext();
  return (
    <div className="game_layout uk-background-muted">
      <div className="left_sidebar">
        <Scoreboard
          players={
            !!players
              ? roundNum === 1
                ? players.filter((player) =>
                    readyUps.includes(player.musicianId)
                  )
                : players
              : ([] as Player[])
          }
        />
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
