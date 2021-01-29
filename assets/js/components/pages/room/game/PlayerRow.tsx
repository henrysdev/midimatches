import React from "react";
import { PlayerData } from "../../../../types";

interface PlayerRowProps {
  player: PlayerData;
  rank: number;
}
const PlayerRow: React.FC<PlayerRowProps> = ({
  player: { playerAlias, playerScore },
  rank,
}) => {
  return (
    <tr>
      <td className="player_row_rank">{rank}</td>
      <td className="player_row_alias">{playerAlias}</td>
      <td className="player_row_score">{playerScore}</td>
    </tr>
  );
};
export { PlayerRow };
