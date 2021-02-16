import React, { useEffect, useState, memo } from "react";
import { PlayerRow } from "./";
import { Player, PlayerData, ScoreTuple } from "../../../../types";

interface ScoreboardProps {
  players: Player[];
  currPlayer: Player;
  scores: Array<ScoreTuple>;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currPlayer,
  scores,
}) => {
  const [playersRowData, setPlayersRowData] = useState<PlayerData[]>();

  useEffect(() => {
    const playersData = players
      .map((player) => {
        const foundTuple = scores.find(
          ([playerId, _score]) => playerId === player.playerId
        );
        const [_, playerScore] = !!foundTuple ? foundTuple : [0, 0];
        return {
          ...player,
          playerScore,
        } as PlayerData;
      })
      .sort((a: PlayerData, b: PlayerData) => b.playerScore - a.playerScore);
    setPlayersRowData(playersData);
  }, [scores]);

  return (
    <div style={{ paddingBottom: "8px" }}>
      {!!playersRowData && playersRowData.length > 0 ? (
        <table
          className="uk-table uk-table-divider"
          style={{
            marginTop: 0,
            marginBottom: 0,
            overflow: "scroll",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
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
                  key={`player-card-${playerData.playerId}`}
                  isCurrPlayer={playerData.playerId === currPlayer.playerId}
                  player={playerData}
                  rank={idx + 1}
                />
              ))
            ) : (
              <></>
            )}
          </tbody>
        </table>
      ) : (
        <></>
      )}
    </div>
  );
};
export { Scoreboard };
