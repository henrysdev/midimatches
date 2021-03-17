import React from "react";
import { PlayerData } from "../../../../types";

interface PlayerRowProps {
  isCurrPlayer: boolean;
  player: PlayerData;
  rank: number;
}

const tdStyle = {
  paddingTop: "1px",
  paddingBottom: "1px",
};

const PlayerRow: React.FC<PlayerRowProps> = ({
  isCurrPlayer,
  player: { playerAlias, playerScore },
  rank,
}) => {
  return (
    <tr
      className={
        isCurrPlayer
          ? "scoreboard_player_row selected_player"
          : "scoreboard_player_row"
      }
    >
      <td>{rank}</td>
      <td>{playerAlias}</td>
      <td>{playerScore}</td>
    </tr>
  );
};
export { PlayerRow };
