import React from "react";
import { Player } from "../../../../types";

interface PlayerRowProps {
  player: Player;
}
const PlayerRow: React.FC<PlayerRowProps> = ({ player: { playerAlias } }) => {
  return (
    <div className="player_row">
      <div className="player_row_name">{playerAlias}</div>
      <div className="player_row_score">Score here</div>
      <div className="player_row_rank">
        <h5>1</h5>
      </div>
    </div>
  );
};
export { PlayerRow };
