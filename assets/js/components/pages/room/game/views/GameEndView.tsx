import React from "react";

import { Title, DynamicContent, Instructions } from "../../../../common";

interface GameEndViewProps {}

const GameEndView: React.FC<GameEndViewProps> = () => {
  return (
    <div>
      <Title title="End of Game" />
      <DynamicContent />
      <Instructions description="Game has ended" />
    </div>
  );
};
export { GameEndView };
