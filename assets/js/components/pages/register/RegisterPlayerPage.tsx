import { Channel, Socket } from "phoenix";
import React, { useEffect, useState } from "react";

import { unmarshalBody } from "../../../utils";
import { ServerlistUpdatePayload, RoomState } from "../../../types";
import {
  SERVERLIST_UPDATE_EVENT,
  MAX_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_ALIAS_LENGTH,
} from "../../../constants";
import {
  FullWidthButton,
  MediumLargeTitle,
  ComputerButton,
} from "../../common";

const RegisterPlayerPage: React.FC = () => {
  const [alias, setAlias] = useState<string>();
  const [urlDestination, setUrlDestination] = useState<string>("/");

  useEffect(() => {
    const windowRef = window as any;
    setUrlDestination(windowRef.urlDestination);
  }, []);

  const handleChange = (e: any) => {
    setAlias(e.target.value.trim());
  };

  const submitRegisterPlayer = (playerAlias: string) => {
    // POST request using fetch inside useEffect React hook
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_alias: playerAlias,
      }),
    };
    fetch("/api/user/edit", requestOptions)
      .then((response) => response.json())
      .then((_data) => {
        window.location.href = urlDestination;
      });
  };

  return (
    <div className="narrow_center_container computer_frame outset_3d_border_deep">
      <MediumLargeTitle>CHOOSE A PLAYER NAME</MediumLargeTitle>
      <form className="register_player_form">
        <fieldset>
          <input
            style={{ marginBottom: "8px" }}
            className="alias_input"
            type="text"
            placeholder="Enter an alias..."
            maxLength={MAX_PLAYER_ALIAS_LENGTH}
            onChange={handleChange}
          />
        </fieldset>
        {!!alias && alias.length < MIN_PLAYER_ALIAS_LENGTH ? (
          <i className="alias_length_warning roboto_font">
            Alias must be at least 3 characters long
          </i>
        ) : (
          <></>
        )}
        {!alias || alias.length < MIN_PLAYER_ALIAS_LENGTH ? (
          <></>
        ) : (
          <ComputerButton
            callback={() => {
              if (!!alias) {
                submitRegisterPlayer(alias);
              }
            }}
            extraClasses={["register_button"]}
          >
            <h5>SUBMIT</h5>
          </ComputerButton>
        )}
      </form>
    </div>
  );
};
export { RegisterPlayerPage };
