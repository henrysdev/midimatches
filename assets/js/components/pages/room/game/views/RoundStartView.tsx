import React from "react";
import { Timer } from "../../../../common";
import { useGameContext } from "../../../../../hooks";

interface RoundStartViewProps {
  pushMessageToChannel: Function;
}

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
}) => {
  const {
    gameRules: {
      viewTimeouts: { roundStart: roundStartTimeout },
    },
  } = useGameContext();
  return (
    <div>
      <h3>RoundStart View</h3>
      <Timer
        descriptionText={"Faceoff starting in "}
        duration={roundStartTimeout}
      />
    </div>
  );
};
export { RoundStartView };
