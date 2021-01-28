import React from "react";
import { PlayerRow } from "./";
import { Player } from "../../../../types";

interface ScoreboardProps {
  players: Player[];
}
const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
  return (
    <div className="scoreboard">
      <h4 className="uk-heading-divider uk-text-center">
        <span>Scoreboard</span>
      </h4>
      <ul className="uk-list uk-list-divider players_list">
        {!!players && players.length > 0 ? (
          players.map((player) => (
            <PlayerRow
              key={`player-card-${player.musicianId}`}
              player={player}
            />
          ))
        ) : (
          <></>
        )}
      </ul>
    </div>
  );
};
export { Scoreboard };
