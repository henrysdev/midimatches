import React, { useEffect, useState, useMemo } from "react";

import { useCurrentUserContext, useSocketContext } from "../../../hooks";
import { PageWrapper } from "..";
import { RecoverAccountForm } from "./RecoverAccountForm";

const RecoverAccountPage: React.FC = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

  const [_readyToContinue, setReadyToContinue] = useState<boolean>(false);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_menu_container computer_frame outset_3d_border_deep">
        <br />
        <div className="main_menu_btn_group">
          <RecoverAccountForm setReadyToContinue={setReadyToContinue} />
        </div>
      </div>
    </PageWrapper>
  );
};
export { RecoverAccountPage };
