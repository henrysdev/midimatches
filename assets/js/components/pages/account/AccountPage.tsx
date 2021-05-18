import React, { useEffect, useState } from "react";

import {
  MediumLargeTitle,
  ComputerButton,
  FixedLeftBackButton,
} from "../../common";
import {
  useCurrentUserContext,
  useSocketContext,
  useLoadLogout,
} from "../../../hooks";
import { PageWrapper } from "..";

const AccountPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const [badRequest, setBadRequest] = useState<boolean>(false);
  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest: logoutRequest,
  } = useLoadLogout();

  useEffect(() => {
    if (!!loaded) {
      window.location.href = "/rooms";
    } else if (!!loadError) {
      setBadRequest(true);
    }
  }, [loaded, loadError]);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <div style={{ padding: "8px", position: "absolute" }}>
          <FixedLeftBackButton
            callback={() => (window.location.href = "/menu")}
            buttonText={"< MENU"}
          />
        </div>

        <br />
        <MediumLargeTitle>
          <span className="accent_bars">///</span>ACCOUNT
        </MediumLargeTitle>
        <br />
        <div className="main_menu_btn_group">
          {!!currentUser ? (
            <div>
              <p className="text_light">
                Username: {currentUser.userAlias}
                <br />
                UserID: {currentUser.userId}
              </p>
            </div>
          ) : (
            <></>
          )}
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => {
                logoutRequest();
              }}
              extraClasses={["register_button"]}
            >
              LOG OUT
            </ComputerButton>
          </div>
          <div className="main_menu_btn">
            <ComputerButton
              callback={() => {
                // deleteAccountRequest();
              }}
              extraClasses={["register_button"]}
              extraStyles={{ backgroundColor: "var(--extra_danger_bg_color)" }}
            >
              DELETE ACCOUNT
            </ComputerButton>
          </div>
        </div>
      </div>
      {badRequest ? (
        <div className="warning_alert roboto_font">
          Error: {`${httpStatus} ${JSON.stringify(data)}`}
        </div>
      ) : (
        <></>
      )}
      {/* </div> */}
    </PageWrapper>
  );
};
export { AccountPage };
