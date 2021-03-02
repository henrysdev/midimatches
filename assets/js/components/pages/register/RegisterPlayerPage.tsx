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
  const [urlDestination, setUrlDestination] = useState<string>("/menu");

  useEffect(() => {
    const windowRef = window as any;
    setUrlDestination(windowRef.urlDestination);
  }, []);

  const handleChange = (e: any) => {
    setAlias(e.target.value.trim());
  };

  return (
    <div className="narrow_center_container computer_frame outset_3d_border_deep">
      <MediumLargeTitle>CHOOSE A PLAYER NAME</MediumLargeTitle>
      <form className="register_player_form">
        <fieldset>
          <input
            style={{ marginBottom: "8px" }}
            className="alias_input roboto_font"
            type="text"
            id="user_alias"
            name="user_alias"
            placeholder="Enter an alias..."
            maxLength={MAX_PLAYER_ALIAS_LENGTH}
            onChange={handleChange}
          />
          <input hidden={true} value={urlDestination} name="url_destination" />
          <input
            className="register_player_submit_button roboto_font"
            disabled={!alias || alias.length < MIN_PLAYER_ALIAS_LENGTH}
            type="submit"
            value="SUBMIT"
          />
        </fieldset>
        {!!alias && alias.length < MIN_PLAYER_ALIAS_LENGTH ? (
          <div className="alias_length_warning roboto_font">
            Alias must be at least 3 characters long
          </div>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
};
export { RegisterPlayerPage };
