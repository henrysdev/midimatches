import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";
import { ResetPasswordForm } from "./ResetPasswordForm";

const ResetPasswordPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const [readyToContinue, setReadyToContinue] = useState<boolean>(false);
  useEffect(() => {
    if (readyToContinue) {
      window.location.href = "/menu";
    }
  }, [readyToContinue]);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <br />
        <div className="main_menu_btn_group">
          <ResetPasswordForm setReadyToContinue={setReadyToContinue} />
        </div>
      </div>
    </PageWrapper>
  );
};
export { ResetPasswordPage };
