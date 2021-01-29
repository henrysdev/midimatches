import React, { useEffect, useState } from "react";
import { PlayerRow } from "./";
import { Player, PlayerData } from "../../../../types";

interface ScoreboardProps {
  players: Player[];
  scores: any;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, scores }) => {
  const [playersRowData, setPlayersRowData] = useState<PlayerData[]>();

  useEffect(() => {
    const playersData = players
      .map((player) => {
        const playerScore =
          player.musicianId in scores ? scores[player.musicianId] : 0;
        return {
          ...player,
          playerScore,
        } as PlayerData;
      })
      .sort((a: PlayerData, b: PlayerData) => b.playerScore - a.playerScore);
    setPlayersRowData(playersData);
  }, [scores]);

  return (
    <table className="uk-table uk-table-divider">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {!!playersRowData && playersRowData.length > 0 ? (
          playersRowData.map((playerData, idx) => (
            <PlayerRow
              key={`player-card-${playerData.musicianId}`}
              player={playerData}
              rank={idx + 1}
            />
          ))
        ) : (
          <></>
        )}
      </tbody>
    </table>
  );
};
export { Scoreboard };
