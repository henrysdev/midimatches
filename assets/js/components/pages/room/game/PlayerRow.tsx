import React from "react";
import { PlayerData } from "../../../../types";

interface PlayerRowProps {
  isCurrPlayer: boolean;
  player: PlayerData;
  rank: number;
}
const PlayerRow: React.FC<PlayerRowProps> = ({
  isCurrPlayer,
  player: { playerAlias, playerScore },
  rank,
}) => {
  return isCurrPlayer ? (
    <tr style={{ backgroundColor: "#fffde6" }}>
      <td className="player_row_rank">
        <strong>{rank}</strong>
      </td>
      <td className="player_row_alias">
        <strong>{playerAlias}</strong>
      </td>
      <td className="player_row_score">
        <strong>{playerScore}</strong>
      </td>
    </tr>
  ) : (
    <tr>
      <td className="player_row_rank">{rank}</td>
      <td className="player_row_alias">{playerAlias}</td>
      <td className="player_row_score">{playerScore}</td>
    </tr>
  );
};
export { PlayerRow };
