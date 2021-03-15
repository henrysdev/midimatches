import React, { useMemo } from "react";

import { HeaderNav, ComputerFrame } from "./components/common/index";
import { useCurrentUser, useSocket, useSyncUser } from "./hooks";
import { CurrentUserContext, SocketContext } from "./contexts";
import { LoadingSpinner, PageContent } from "./components/common";
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

  const clockOffset = useMemo(() => {
    if (syncLoaded && !!syncData) {
      const { firstHopDeltaTime, serverTime } = unmarshalBody(syncData) as any;
      const clientEndTime = currUtcTimestamp();
      const msOffset = Math.floor(
        (firstHopDeltaTime + (serverTime - clientEndTime)) / 2
      );
      console.log(msOffset);
      return msOffset;
    } else {
      return 0;
    }
  }, [syncData, syncLoaded]);

  return userLoaded && syncLoaded ? (
    <CurrentUserContext.Provider
      value={{ user: currUserData.user, clockOffset }}
    >
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
      </SocketContext.Provider>
    </CurrentUserContext.Provider>
  ) : userLoadError || syncLoadError ? (
    <>FAILED</>
  ) : (
    <ComputerFrame>
      <LoadingSpinner />
    </ComputerFrame>
  );
};

export default Main;
