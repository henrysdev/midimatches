import React, { useState } from "react";

import { WarmUp } from ".";
import { User } from "../../../../types";

interface PregameCenterPaneProps {
  gameInProgress: boolean;
  currentUser: User;
}

const PregameCenterPane: React.FC<PregameCenterPaneProps> = ({
  gameInProgress,
  currentUser,
}) => {
  return (
    <div className="pregame_content_pane" style={{ marginLeft: "16px" }}>
      <div className="inline_screen inset_3d_border_shallow">
        {gameInProgress ? (
          <div>
            <p>
              <strong>Game in progress.</strong> A new game will be starting in
              a few minutes. Feel free to
              <a href="/servers">find another server</a> or play keyboard in the
              meantime.
            </p>
            <WarmUp />
          </div>
        ) : (
          <div>
            <div>
              <p>
                Joined successfully as <strong>{currentUser.userAlias}</strong>.
                Warm up your fingers a bit! Waiting for more players...
              </p>
              <WarmUp />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export { PregameCenterPane };
