import React, { useEffect, useState } from "react";

import { MediumLargeTitle, ComputerButton } from "../../common";
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
        <br />
        <MediumLargeTitle>
          <span className="accent_bars">///</span>ACCOUNT
        </MediumLargeTitle>
        <div className="main_menu_btn_group">
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
        </div>
      </div>
      {badRequest ? (
        <div className="warning_alert roboto_font">
          Error: {`${httpStatus} ${JSON.stringify(data)}`}
        </div>
      ) : (
        <></>
      )}
    </PageWrapper>
  );
};
export { AccountPage };
