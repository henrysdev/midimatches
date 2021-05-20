import React, { useState } from "react";

import { Leaderboard } from ".";
import { useSocketContext, useCurrentUserContext } from "../../../hooks";
import { ComputerFrame } from "../../common";
import { PageWrapper } from "..";

const LeaderboardPage: React.FC = () => {
  const { socket } = useSocketContext();
  const { user: currentUser } = useCurrentUserContext();

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ComputerFrame>
        <div className="serverlist_page_content">
          <Leaderboard />
        </div>
      </ComputerFrame>
    </PageWrapper>
  );
};
export { LeaderboardPage };
