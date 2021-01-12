import React, { useContext, useEffect, useState } from 'react';

import { GameContext } from '../../../../../contexts';
import { GameContextType } from '../../../../../types';

interface RoundEndViewProps {
  winnerId: string;
  winnerNumVotes: number;
}

const RoundEndView: React.FC<RoundEndViewProps> = () => {
  const gameContext: GameContextType = useContext(GameContext);
  const [winner, setWinner] = useState({ winnerId: "", numVotes: 0 });

  useEffect(() => {
    if (!!gameContext.winner) {
      setWinner(gameContext.winner);
    }
  }, [gameContext.winner]);

  return (
    <div>
      <h3>RoundEnd View</h3>
      {!!gameContext.winner ? (
        <div>{`${winner.winnerId} won with ${winner.numVotes} votes`}</div>
      ) : (
        <div></div>
      )}
    </div>
  );
};
export { RoundEndView };
