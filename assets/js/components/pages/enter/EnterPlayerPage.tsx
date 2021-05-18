import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";
import { PlayWithoutSaveForm } from "./PlayWithoutSaveForm";
import {
  MediumLargeTitle,
  MediumTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
  ComputerButton,
} from "../../common";
import { CreateAccountForm } from "./CreateAccountForm";
import { AccountLoginForm } from "./AccountLoginForm";

export enum RegistrationView {
  LOGIN,
  CREATE_ACCOUNT,
  PLAY_WITHOUT_SAVE,
}

const EnterPlayerPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const [urlDestination, setUrlDestination] = useState<string>("/menu");
  const [readyToContinue, setReadyToContinue] = useState<boolean>(false);
  useEffect(() => {
    const windowRef = window as any;
    setUrlDestination(windowRef.urlDestination);
  }, []);
  useEffect(() => {
    if (readyToContinue) {
      window.location.href = urlDestination;
    }
  }, [readyToContinue]);

  const [registrationView, setRegistrationView] = useState<RegistrationView>(
    RegistrationView.LOGIN
  );

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div
        style={{ overflowY: "auto" }}
        className="narrow_center_container computer_frame outset_3d_border_deep"
      >
        <div className="main_menu_btn_group">
          {(() => {
            switch (registrationView) {
              case RegistrationView.CREATE_ACCOUNT:
                return (
                  <div>
                    <CreateAccountForm
                      setReadyToContinue={setReadyToContinue}
                      setLoginView={() =>
                        setRegistrationView(RegistrationView.LOGIN)
                      }
                    />
                  </div>
                );
              case RegistrationView.LOGIN:
                return (
                  <div>
                    <AccountLoginForm
                      setReadyToContinue={setReadyToContinue}
                      setCreateAccountView={() =>
                        setRegistrationView(RegistrationView.CREATE_ACCOUNT)
                      }
                      setPlayWithoutSaveView={() =>
                        setRegistrationView(RegistrationView.PLAY_WITHOUT_SAVE)
                      }
                    />
                  </div>
                );
              case RegistrationView.PLAY_WITHOUT_SAVE:
                return (
                  <div>
                    <PlayWithoutSaveForm
                      setReadyToContinue={setReadyToContinue}
                      setLoginView={() =>
                        setRegistrationView(RegistrationView.LOGIN)
                      }
                      setCreateAccountView={() =>
                        setRegistrationView(RegistrationView.CREATE_ACCOUNT)
                      }
                    />
                  </div>
                );
            }
          })()}
        </div>
      </div>
    </PageWrapper>
  );
};
export { EnterPlayerPage };
