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
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AccountDetailsCard } from "./AccountDetailsCard";
import { DeleteAccountForm } from "./DeleteAccountForm";

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
      <div
        style={{ overflowY: "auto" }}
        className="narrow_center_container computer_frame outset_3d_border_deep"
      >
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
          <AccountDetailsCard />
          <ComputerButton
            callback={() => {
              logoutRequest();
            }}
            extraClasses={["register_button"]}
          >
            LOG OUT
          </ComputerButton>
          <br />
          <ChangePasswordForm />
          <DeleteAccountForm />
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
