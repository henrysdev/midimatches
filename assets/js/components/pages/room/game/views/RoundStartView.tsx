import React from "react";
import { Timer } from "../../../../common";

interface RoundStartViewProps {
  pushMessageToChannel: Function;
}

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
}) => {
  return (
    <div>
      <h3>RoundStart View</h3>
      <Timer
        descriptionText={"Faceoff starting in "}
        timesUpText={"Starting..."}
        duration={3000}
      />
    </div>
  );
};
export { RoundStartView };
