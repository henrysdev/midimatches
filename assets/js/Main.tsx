import React, { useMemo } from "react";

import { HeaderNav, ComputerFrame } from "./components/common/index";
import {
  useCurrentUser,
  useSocket,
  useSyncUser,
  useBrowserCompatibilityContextProvider,
} from "./hooks";
import {
  CurrentUserContext,
  SocketContext,
  ClockOffsetContext,
  BrowserCompatibilityContext,
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

  const {
    supportedBrowser,
    showCompatibilityWarning,
    setShowCompatibilityWarning,
  } = useBrowserCompatibilityContextProvider();

  return userLoaded && syncLoaded ? (
    <CurrentUserContext.Provider value={{ user: currUserData.user }}>
      <BrowserCompatibilityContext.Provider
        value={{
          supportedBrowser: supportedBrowser,
          showCompatibilityWarning,
          setShowCompatibilityWarning,
        }}
      >
        <ClockOffsetContext.Provider value={{ clockOffset }}>
          <SocketContext.Provider value={{ socket: socket }}>
            <HeaderNav
              playerAlias={
                !!currUserData && !!currUserData.user
                  ? currUserData.user.userAlias
                  : undefined
              }
              browserWarning={!supportedBrowser}
            />
            <PageContent>
              <PageRouter />
            </PageContent>
            <FooterBar />
          </SocketContext.Provider>
        </ClockOffsetContext.Provider>
      </BrowserCompatibilityContext.Provider>
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
