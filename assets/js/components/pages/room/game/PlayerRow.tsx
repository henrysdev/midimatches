import React from "react";

interface PlayerRowProps {
  musicianId: string;
}
const PlayerRow: React.FC<PlayerRowProps> = ({ musicianId }) => {
  return (
    <div className="player_row">
      <div className="player_row_name">{musicianId}</div>
      <div className="player_row_score">Score here</div>
      <div className="player_row_rank">
        <h5>1</h5>
      </div>
    </div>
  );
};
export { PlayerRow };
