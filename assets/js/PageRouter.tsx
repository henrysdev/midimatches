import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Header } from "./components/common/index";
import { LandingPage, RoomPage } from "./components/pages/index";

const PageRouter: React.FC = () => (
  <>
    <Header />
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/room" component={RoomPage} />
      </Switch>
    </BrowserRouter>
  </>
);

export default PageRouter;
