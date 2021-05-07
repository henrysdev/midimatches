import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "../";
import { PlayWithoutSaveForm } from "./PlayWithoutSaveForm";
import {
  MediumLargeTitle,
  MediumTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
  ComputerButton,
} from "../../common";
import { CreateAccountForm } from "./CreateAccountForm";

enum RegistrationView {
  MAIN,
  CREATE_ACCOUNT,
  SIGN_IN,
  PLAY_WITHOUT_SAVE,
}

const RegisterPlayerPage: React.FC = () => {
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
    RegistrationView.MAIN
  );

  const backButton = (
    <div className="main_menu_btn_group">
      <div className="main_menu_btn">
        <ComputerButton
          callback={() => setRegistrationView(RegistrationView.MAIN)}
          extraClasses={["register_button"]}
          extraStyles={{ whiteSpace: "nowrap" }}
        >
          {"< GO BACK"}
        </ComputerButton>
      </div>
    </div>
  );

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <br />
        {(() => {
          switch (registrationView) {
            case RegistrationView.MAIN:
              return (
                <div className="main_menu_btn_group">
                  <div className="main_menu_btn">
                    <ComputerButton
                      callback={() =>
                        setRegistrationView(RegistrationView.CREATE_ACCOUNT)
                      }
                      extraClasses={["register_button"]}
                    >
                      CREATE ACCOUNT
                    </ComputerButton>
                  </div>
                  <div className="main_menu_btn">
                    <ComputerButton
                      callback={() =>
                        setRegistrationView(RegistrationView.SIGN_IN)
                      }
                      extraClasses={["register_button"]}
                    >
                      SIGN IN
                    </ComputerButton>
                  </div>
                  <div className="main_menu_btn">
                    <ComputerButton
                      callback={() =>
                        setRegistrationView(RegistrationView.PLAY_WITHOUT_SAVE)
                      }
                      extraClasses={["register_button"]}
                      extraStyles={{ whiteSpace: "nowrap" }}
                    >
                      PLAY WITHOUT SAVE
                    </ComputerButton>
                  </div>
                </div>
              );
            case RegistrationView.CREATE_ACCOUNT:
              return (
                <div>
                  <CreateAccountForm setReadyToContinue={setReadyToContinue} />
                  {backButton}
                </div>
              );
            case RegistrationView.PLAY_WITHOUT_SAVE:
              return (
                <div>
                  <PlayWithoutSaveForm
                    setReadyToContinue={setReadyToContinue}
                  />
                  {backButton}
                </div>
              );
          }
        })()}
      </div>
    </PageWrapper>
  );
};
export { RegisterPlayerPage };
