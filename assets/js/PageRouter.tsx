import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { HeaderNav } from "./components/common/index";
import {
  LandingPage,
  RoomPage,
  RegisterPlayerPage,
} from "./components/pages/index";
import { isMobile } from "react-device-detect";
import { useCurrentUser } from "./hooks";

const PageRouter: React.FC = () => {
  const { data: currUserData, loading, loaded, loadError } = useCurrentUser();

  return (
    <div>
      <HeaderNav
        playerAlias={
          !!currUserData && !!currUserData.user
            ? currUserData.user.userAlias
            : undefined
        }
      />
      {isMobile ? (
        <div>
          <strong>Note: </strong>Progressions is not currently supported on
          mobile.
        </div>
      ) : (
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/room" component={RoomPage} />
            <Route path="/register" component={RegisterPlayerPage} />
          </Switch>
        </BrowserRouter>
      )}
    </div>
  );
};

export default PageRouter;
