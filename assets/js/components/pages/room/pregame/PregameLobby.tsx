import React, { useEffect } from 'react';

import { SUBMIT_ENTER_ROOM, SUBMIT_LEAVE_ROOM } from '../../../../constants';
import { SimpleButton } from '../../../common';

interface PregameLobbyProps {
  pushMessageToChannel: Function;
}

const PregameLobby: React.FC<PregameLobbyProps> = ({
  pushMessageToChannel,
}) => {
  window.addEventListener("beforeunload", () =>
    pushMessageToChannel(SUBMIT_LEAVE_ROOM, {})
  );

  return (
    <div>
      <h3>REAL REAL PregameLobby</h3>
      <SimpleButton
        label="Join Room"
        callback={() => {
          pushMessageToChannel(SUBMIT_ENTER_ROOM, {});
        }}
        disabled={false}
      />
    </div>
  );
};
export { PregameLobby };
