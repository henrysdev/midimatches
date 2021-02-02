import React from "react";
import { useGameContext, usePlayerContext } from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";
import { GameSettings } from "./";

interface LeftSidebarProps {}

const LeftSidebar: React.FC<LeftSidebarProps> = ({}) => {
  const { players, readyUps, roundNum, scores } = useGameContext();
  const { player: currPlayer } = usePlayerContext();
  return (
    <div className="left_sidebar">
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
      <hr className="uk-divider-icon"></hr>
      <GameSettings />
    </div>
  );
};
export { LeftSidebar };
