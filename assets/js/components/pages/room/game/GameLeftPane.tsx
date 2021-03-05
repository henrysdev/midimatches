import React, { memo, useEffect } from "react";
import {
  useGameContext,
  usePlayerContext,
  usePlayersContext,
  useScoresContext,
} from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";
import { GameSettings } from ".";
import { ChatBox } from "../../../common";

interface GameLeftPaneProps {}

const GameLeftPane: React.FC<GameLeftPaneProps> = memo(({}) => {
  const { players = [] } = usePlayersContext();
  const { scores } = useScoresContext();
  const { player: currPlayer } = usePlayerContext();
  return (
    <div className="left_game_content_pane">
      <div className="left_game_content_pane_flex_anchor">
        <div className="scoreboard_flex_wrapper inset_3d_border_deep">
          <Scoreboard
            players={
              !!players
                ? players.sort((a, b) =>
                    a.playerAlias.localeCompare(b.playerAlias)
                  )
                : ([] as Player[])
            }
            currPlayer={currPlayer}
            scores={scores}
          />
        </div>
        <div className="settings_flex_wrapper inset_3d_border_deep">
          <GameSettings />
        </div>
      </div>
    </div>
  );
});
export { GameLeftPane };
