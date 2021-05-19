import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";
import { RecoverAccountForm } from "./RecoverAccountForm";
import { FixedLeftBackButton } from "../../common";

const RecoverAccountPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const [_readyToContinue, setReadyToContinue] = useState<boolean>(false);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <br />
        <div className="main_menu_btn_group">
          <div style={{ padding: "8px", position: "absolute" }}>
            <FixedLeftBackButton
              callback={() => (window.location.href = "/enter")}
              buttonText={"< LOGIN"}
              extraStyles={{ top: "-32px", left: "-16px" }}
            />
          </div>
          <RecoverAccountForm setReadyToContinue={setReadyToContinue} />
        </div>
      </div>
    </PageWrapper>
  );
};
export { RecoverAccountPage };
