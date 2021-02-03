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
  return isCurrPlayer ? (
    <tr style={{ ...tdStyle, backgroundColor: "#ccdcff" }}>
      <td style={{ ...tdStyle, textAlign: "center" }}>
        <strong>{rank}</strong>
      </td>
      <td style={tdStyle}>
        <strong>{playerAlias}</strong>
      </td>
      <td style={{ ...tdStyle, textAlign: "center" }}>
        <strong>{playerScore}</strong>
      </td>
    </tr>
  ) : (
    <tr>
      <td style={{ ...tdStyle, textAlign: "center" }}>{rank}</td>
      <td style={tdStyle}>{playerAlias}</td>
      <td style={{ ...tdStyle, textAlign: "center" }}>{playerScore}</td>
    </tr>
  );
};
export { PlayerRow };
