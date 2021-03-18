import React, { useMemo } from "react";

import { HeaderNav, ComputerFrame } from "./components/common/index";
import { useCurrentUser, useSocket, useSyncUser } from "./hooks";
import {
  CurrentUserContext,
  SocketContext,
  ClockOffsetContext,
} from "./contexts";
import { LoadingSpinner, PageContent, FooterBar } from "./components/common";
import { unmarshalBody, currUtcTimestamp } from "./utils";
import PageRouter from "./PageRouter";

const Main: React.FC = () => {
  const {
    data: currUserData,
    loading: userLoading,
    loaded: userLoaded,
    loadError: userLoadError,
  } = useCurrentUser();
  const {
    data: syncData,
    loading: syncLoading,
    loaded: syncLoaded,
    loadError: syncLoadError,
  } = useSyncUser();
  const socket = useSocket();

  // TODO pull into hook
  const clockOffset = useMemo(() => {
    if (syncLoaded && !!syncData) {
      const { firstHopDeltaTime, serverTime } = unmarshalBody(syncData) as any;
      const clientEndTime = currUtcTimestamp();
      const msOffset = Math.floor(
        -1 * ((firstHopDeltaTime + (serverTime - clientEndTime)) / 2)
      );
      console.log("local clock offset ", msOffset);
      return msOffset;
    } else {
      return 0;
    }
  }, [syncData, syncLoaded]);

  return userLoaded && syncLoaded ? (
    <CurrentUserContext.Provider value={{ user: currUserData.user }}>
      <ClockOffsetContext.Provider value={{ clockOffset }}>
        <SocketContext.Provider value={{ socket: socket }}>
          <HeaderNav
            playerAlias={
              !!currUserData && !!currUserData.user
                ? currUserData.user.userAlias
                : undefined
            }
          />
          <PageContent>
            <PageRouter />
          </PageContent>
          <FooterBar />
        </SocketContext.Provider>
      </ClockOffsetContext.Provider>
    </CurrentUserContext.Provider>
  ) : userLoadError || syncLoadError ? (
    <>FAILED</>
  ) : (
    <div className="full_height relative_anchor">
      <div className="centered_div">
        <LoadingSpinner />
      </div>
    </div>
  );
};

export default Main;
