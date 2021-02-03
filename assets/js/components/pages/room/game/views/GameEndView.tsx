import React from "react";

import { Title, DynamicContent, Instructions } from "../../../../common";

interface GameEndViewProps {}

const GameEndView: React.FC<GameEndViewProps> = () => {
  return (
    <div>
      <Title title="End of Game" />
      <Instructions description="Game has ended" />
      <DynamicContent />
    </div>
  );
};
export { GameEndView };
