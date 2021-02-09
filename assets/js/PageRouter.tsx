import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { MobilePlaceholder } from "./MobilePlaceholder";

import {
  LandingPage,
  RoomPage,
  RegisterPlayerPage,
  ServerlistPage,
} from "./components/pages/index";

const PageRouter: React.FC = () => {
  return isMobile ? (
    <MobilePlaceholder />
  ) : (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/servers" component={ServerlistPage} />
        <Route path="/room" component={RoomPage} />
        <Route path="/register" component={RegisterPlayerPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default PageRouter;
