import React from "react";

interface RoundStartViewProps {
  pushMessageToChannel: Function;
}

const RoundStartView: React.FC<RoundStartViewProps> = ({
  pushMessageToChannel,
}) => {
  return (
    <div>
      <h3>RoundStart View</h3>
      TODO BRACKET HERE SHOWING WHOS PLAYING
    </div>
  );
};
export { RoundStartView };
