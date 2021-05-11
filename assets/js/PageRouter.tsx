import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import {
  AboutPage,
  PracticePage,
  RoomPage,
  EnterPlayerPage,
  ServerlistPage,
  MenuPage,
  PrivacyPolicyPage,
  TermsPage,
  ResetPasswordPage,
  RecoverAccountPage,
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
          <Route path="/enter" component={EnterPlayerPage} />
          <Route path="/privacy" component={PrivacyPolicyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/account/recover" component={RecoverAccountPage} />
          <Route path="/account/reset" component={ResetPasswordPage} />
        </Switch>
      )}
    </BrowserRouter>
  );
};

export { PageRouter };
