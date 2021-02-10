import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../types";
import {
  SERVERLIST_UPDATE_EVENT,
  MAX_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_ALIAS_LENGTH,
} from "../../constants";
import { FullWidthButton, MediumLargeTitle } from ".";

const EditUser: React.FC = () => {
  const [alias, setAlias] = useState<string>();

  const handleChange = (e: any) => {
    setAlias(e.target.value.trim());
  };

  const submitEditUser = (playerAlias: string) => {
    // POST request using fetch inside useEffect React hook
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_alias: playerAlias,
      }),
    };
    fetch("/api/user/edit", requestOptions).then((response) => response.json());
  };

  return (
    <div>
      <div
        style={{
          maxWidth: "400px",
          margin: "auto",
          marginTop: "16px",
          padding: "24px",
          boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
          color: "#666",
        }}
      >
        <MediumLargeTitle title="Choose an Alias to Continue" />
        <form style={{ margin: 0 }}>
          <fieldset className="uk-fieldset">
            <input
              style={{ marginBottom: "8px" }}
              className="uk-input"
              type="text"
              placeholder="Enter an alias..."
              maxLength={MAX_PLAYER_ALIAS_LENGTH}
              onChange={handleChange}
            />
          </fieldset>
          <FullWidthButton
            label="Continue"
            callback={() => {
              if (!!alias) {
                submitEditUser(alias);
              }
            }}
            disabled={!alias || alias.length < MIN_PLAYER_ALIAS_LENGTH}
          />
          {!!alias && alias.length < MIN_PLAYER_ALIAS_LENGTH ? (
            <i style={{ marginLeft: 10, color: "red" }}>
              Alias must be at least 3 characters long
            </i>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
};
export { EditUser };
