import React, { memo, useState, useEffect } from "react";
import {
  useGameContext,
  usePlayerContext,
  usePlayersContext,
  useScoresContext,
} from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";
import { GameSettings } from ".";
import { ChatBox, ContentButton, InlineWidthButton } from "../../../common";

interface GameLeftPaneProps {}

enum ColumnView {
  SCOREBOARD,
  CHAT,
  SETTINGS,
}

const GameLeftPane: React.FC<GameLeftPaneProps> = memo(({}) => {
  const { players = [] } = usePlayersContext();
  const { scores } = useScoresContext();
  const { player: currPlayer } = usePlayerContext();

  const [columnView, setColumnView] = useState<ColumnView>(ColumnView.SETTINGS);

  return (
    <div className="left_game_multi_container">
      <div className="multi_use_items_container">
        <div className="multi_use_item_wrapper">
          <div
            className={
              columnView === ColumnView.SCOREBOARD
                ? "multi_use_item selected_multi_use_item"
                : "multi_use_item"
            }
            onClick={() => setColumnView(ColumnView.SCOREBOARD)}
          >
            <h5 style={{ textAlign: "center" }}>Scoreboard</h5>
          </div>
        </div>
        <div className="multi_use_item_wrapper">
          <div
            className={
              columnView === ColumnView.CHAT
                ? "multi_use_item selected_multi_use_item"
                : "multi_use_item"
            }
            onClick={() => setColumnView(ColumnView.CHAT)}
          >
            <h5 style={{ textAlign: "center" }}>Chat</h5>
          </div>
        </div>
        <div className="multi_use_item_wrapper">
          <div
            className={
              columnView === ColumnView.SETTINGS
                ? "multi_use_item selected_multi_use_item"
                : "multi_use_item"
            }
            onClick={() => setColumnView(ColumnView.SETTINGS)}
          >
            <h5 style={{ textAlign: "center" }}>Settings</h5>
          </div>
        </div>
      </div>
      {columnView === ColumnView.SETTINGS ? (
        <div className="game_left_content_pane_wrapper">
          <div className="left_game_content_pane">
            <div className="left_game_content_pane_flex_anchor">
              <div className="settings_flex_wrapper inset_3d_border_deep">
                <GameSettings />
              </div>
            </div>
          </div>
        </div>
      ) : columnView === ColumnView.CHAT ? (
        <div className="game_right_content_pane_wrapper">
          <div className="right_game_content_pane_flex_anchor">
            <div className="chatbox_flex_wrapper inset_3d_border_deep">
              <ChatBox players={players} currPlayer={currPlayer} />
            </div>
          </div>
        </div>
      ) : (
        <div className="game_left_content_pane_wrapper">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
export { GameLeftPane };
