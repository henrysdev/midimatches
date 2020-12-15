import React, { useContext } from "react";
import { GameContext } from "../../contexts/index";

const GameContextDebug: React.FC = () => {
  const gameContext = useContext(GameContext);
  return (
    <div>
      <h3>Current Game Context [DEBUG]</h3>
      {JSON.stringify(gameContext, null, 2)}
    </div>
  );
};
export { GameContextDebug };
