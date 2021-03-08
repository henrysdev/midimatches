import { Channel, Socket } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

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
  InlineWidthInputSubmit,
} from "../../common";

const RegisterPlayerPage: React.FC = () => {
  const [alias, setAlias] = useState<string>("");
  const [urlDestination, setUrlDestination] = useState<string>("/menu");

  useEffect(() => {
    const windowRef = window as any;
    setUrlDestination(windowRef.urlDestination);
  }, []);

  const handleChange = (e: any) => {
    setAlias(e.target.value);
  };

  const trimmedAlias = useMemo(() => {
    return alias.trim();
  }, [alias]);

  return (
    <div className="narrow_center_container computer_frame outset_3d_border_deep">
      <br />
      <MediumLargeTitle>///PLAYER NAME</MediumLargeTitle>
      <div className="register_content_wrapper inset_3d_border_deep inline_screen">
        <form className="register_player_form" autoComplete="off">
          <fieldset>
            <input
              className="inline_width_text_input roboto_font"
              type="text"
              id="user_alias"
              name="user_alias"
              placeholder="Enter player name..."
              maxLength={MAX_PLAYER_ALIAS_LENGTH}
              onChange={handleChange}
            />
            {!!trimmedAlias && trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH ? (
              <div className="alias_length_warning roboto_font">
                Alias must be at least 3 characters long
              </div>
            ) : (
              <></>
            )}
            <input
              hidden={true}
              defaultValue={urlDestination}
              name="url_destination"
            />
            <InlineWidthInputSubmit
              label="SUBMIT"
              disabled={
                !trimmedAlias || trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH
              }
            />
          </fieldset>
        </form>
      </div>
    </div>
  );
};
export { RegisterPlayerPage };
