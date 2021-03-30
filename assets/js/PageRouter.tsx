import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import {
  AboutPage,
  PracticePage,
  RoomPage,
  RegisterPlayerPage,
  ServerlistPage,
  MenuPage,
  PrivacyPolicyPage,
} from "./components/pages/index";
import { useBrowserCompatibilityContext } from "./hooks";
import { MobileAboutPage } from "./components/pages/about/MobileAboutPage";
import { MobilePrivacyPolicyPage } from "./components/pages/privacy/MobilePrivacyPolicyPage";

const PageRouter: React.FC = () => {
  const { isMobileDevice } = useBrowserCompatibilityContext();
  return (
    <BrowserRouter>
      {isMobileDevice ? (
        <Switch>
          <Route exact path="/about" component={MobileAboutPage} />
          <Route path="/privacy" component={MobilePrivacyPolicyPage} />
        </Switch>
      ) : (
        <Switch>
          <Route exact path="/about" component={AboutPage} />
          <Route path="/menu" component={MenuPage} />
          <Route path="/rooms" component={ServerlistPage} />
          <Route path="/room" component={RoomPage} />
          <Route path="/practice" component={PracticePage} />
          <Route path="/register" component={RegisterPlayerPage} />
          <Route path="/privacy" component={PrivacyPolicyPage} />
        </Switch>
      )}
    </BrowserRouter>
  );
};

export { PageRouter };
