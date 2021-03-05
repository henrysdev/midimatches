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

interface GameRightPaneProps {}

const GameRightPane: React.FC<GameRightPaneProps> = memo(({}) => {
  const { players = [] } = usePlayersContext();
  const { scores } = useScoresContext();
  const { player: currPlayer } = usePlayerContext();
  return (
    <div className="right_game_content_pane_flex_anchor">
      <div className="chatbox_flex_wrapper inset_3d_border_deep">
        <ChatBox players={players} />
      </div>
    </div>
  );
});
export { GameRightPane };
