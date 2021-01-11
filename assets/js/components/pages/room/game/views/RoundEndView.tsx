import React, { useContext, useState } from 'react';

interface RoundEndViewProps {
  pushMessageToChannel: Function;
}

const RoundEndView: React.FC<RoundEndViewProps> = ({
  pushMessageToChannel,
}) => {
  return (
    <div>
      <h3>RoundEnd View</h3>
      TODO SHOW WINNER HERE AND HOW MANY VOTES THEY GOT
    </div>
  );
};
export { RoundEndView };
