import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { MobilePlaceholder } from "./MobilePlaceholder";

import {
  AboutPage,
  PracticePage,
  RoomPage,
  RegisterPlayerPage,
  ServerlistPage,
  MenuPage,
} from "./components/pages/index";

const PageRouter: React.FC = () => {
  return isMobile ? (
    <MobilePlaceholder />
  ) : (
    <BrowserRouter>
      <Switch>
        <Route exact path="/about" component={AboutPage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/rooms" component={ServerlistPage} />
        <Route path="/room" component={RoomPage} />
        <Route path="/practice" component={PracticePage} />
        <Route path="/register" component={RegisterPlayerPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default PageRouter;
