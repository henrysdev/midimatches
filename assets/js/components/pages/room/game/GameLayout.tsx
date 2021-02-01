import React from "react";
import { useGameContext, usePlayerContext } from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";
import { LeftSidebar } from "./";

interface GameLayoutProps {
  children?: any;
}
const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { players, readyUps, roundNum, scores } = useGameContext();
  const { player: currPlayer } = usePlayerContext();
  return (
    <div className="game_layout uk-background-muted">
      <LeftSidebar>
        <Scoreboard
          players={
            !!players
              ? roundNum === 1
                ? players
                    .filter((player) => readyUps.includes(player.musicianId))
                    .sort((a, b) => a.playerAlias.localeCompare(b.playerAlias))
                : players
              : ([] as Player[])
          }
          currPlayer={currPlayer}
          scores={scores}
        />
        {/* <div className="settings_box">
          <h4 className="uk-heading-divider uk-text-center">
            <span>Statistics</span>
          </h4>
        </div> */}
      </LeftSidebar>
      <div className="game_content_container uk-background-default">
        {children}
      </div>
    </div>
  );
};
export { GameLayout };
