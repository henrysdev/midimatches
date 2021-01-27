import React from "react";
import { PlayerRow } from "./";

interface ScoreboardProps {
  musicianIds?: string[];
}
const Scoreboard: React.FC<ScoreboardProps> = ({ musicianIds }) => {
  return (
    <div className="scoreboard">
      <h4 className="uk-heading-divider uk-text-center">
        <span>Scoreboard</span>
      </h4>
      <ul className="uk-list uk-list-divider players_list">
        {!!musicianIds && musicianIds.length > 0 ? (
          musicianIds.map((musicianId) => (
            <PlayerRow
              key={`player-card-${musicianId}`}
              musicianId={musicianId}
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
