import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Header } from "./components/common/index";
import { LandingPage, RoomPage } from "./components/pages/index";
import { isMobile } from "react-device-detect";

const PageRouter: React.FC = () => (
  <div>
    <Header />
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
        </Switch>
      </BrowserRouter>
    )}
  </div>
);

export default PageRouter;
