import React from "react";

import { HeaderNav } from "./components/common/index";
import { useCurrentUser, useSocket } from "./hooks";
import { CurrentUserContext, SocketContext } from "./contexts";
import PageRouter from "./PageRouter";

const Main: React.FC = () => {
  const { data: currUserData, loading, loaded } = useCurrentUser();
  const socket = useSocket();

  return loaded ? (
    <div>
      <CurrentUserContext.Provider value={{ user: currUserData.user }}>
        <SocketContext.Provider value={{ socket: socket }}>
          <HeaderNav
            playerAlias={
              !!currUserData && !!currUserData.user
                ? currUserData.user.userAlias
                : undefined
            }
          />
          <PageRouter />
        </SocketContext.Provider>
      </CurrentUserContext.Provider>
    </div>
  ) : loading ? (
    <div>LOADING</div>
  ) : (
    <></>
  );
};

export default Main;
