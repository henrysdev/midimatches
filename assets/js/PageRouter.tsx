import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Header } from './components/common/Header';
import { LandingPage } from './pages/landing';
import { RoomPage } from './pages/room';

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
