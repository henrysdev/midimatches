import React, { useEffect, useState, useMemo } from "react";

import { MediumTitle } from "../../common";
import { useCurrentUserContext } from "../../../hooks";

interface AccountDetailsCardProps {}

const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({}) => {
  const { user: currentUser } = useCurrentUserContext();
  return (
    <div>
      <MediumTitle
        extraStyles={{ paddingLeft: "8px", paddingTop: "8px" }}
        centered={false}
      >
        DETAILS
      </MediumTitle>
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
    </div>
  );
};
export { AccountDetailsCard };
