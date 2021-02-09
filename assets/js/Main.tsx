import * as React from "react";

import { HeaderNav } from "./components/common/index";
import { isMobile } from "react-device-detect";
import { useCurrentUser } from "./hooks";
import { CurrentUserContext } from "./contexts";
import PageRouter from "./PageRouter";

const Main: React.FC = () => {
  const { data: currUserData, loading, loaded } = useCurrentUser();

  return loaded ? (
    <div>
      <CurrentUserContext.Provider value={{ user: currUserData.user }}>
        <HeaderNav
          playerAlias={
            !!currUserData && !!currUserData.user
              ? currUserData.user.userAlias
              : undefined
          }
        />
        <PageRouter />
      </CurrentUserContext.Provider>
    </div>
  ) : loading ? (
    <div>LOADING</div>
  ) : (
    <></>
  );
};

export default Main;
