import React from "react";

import { HeaderNav, ComputerFrame } from "./components/common/index";
import { useCurrentUser, useSocket } from "./hooks";
import { CurrentUserContext, SocketContext } from "./contexts";
import { LoadingSpinner, PageContent } from "./components/common";
import PageRouter from "./PageRouter";

const Main: React.FC = () => {
  const { data: currUserData, loading, loaded } = useCurrentUser();
  const socket = useSocket();

  return loaded ? (
    <CurrentUserContext.Provider value={{ user: currUserData.user }}>
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
  ) : loading ? (
    <ComputerFrame>
      <LoadingSpinner />
    </ComputerFrame>
  ) : (
    <></>
  );
};

export default Main;
