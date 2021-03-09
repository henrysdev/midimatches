import { Channel, Socket } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

import { unmarshalBody } from "../../../utils";
import { UpdateUserPayload, RoomState } from "../../../types";
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
  VinylLoadingSpinner,
} from "../../common";
import { useLoadUpdateUser } from "../../../hooks/useLoadUpdateUser";

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

  const requestBody = useMemo((): UpdateUserPayload => {
    return {
      user_alias: trimmedAlias,
    };
  }, [trimmedAlias]);

  const {
    data,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadUpdateUser();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loaded && !!data && !!data.error) {
      setBadRequest(true);
    } else if (!!loaded) {
      window.location.href = urlDestination;
    }
  }, [loaded]);

  return (
    <div className="narrow_center_container computer_frame outset_3d_border_deep">
      <br />
      <MediumLargeTitle>///PLAYER NAME</MediumLargeTitle>
      <div className="register_content_wrapper inset_3d_border_deep inline_screen">
        {loading ? (
          <VinylLoadingSpinner />
        ) : loadError ? (
          <div className="warning_alert roboto_font">
            Failed to get response from server
          </div>
        ) : (
          <form
            className="register_player_form"
            autoComplete="off"
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitRequest(requestBody);
              }
            }}
            onSubmit={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              submitRequest(requestBody);
            }}
          >
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
              {!!trimmedAlias &&
              trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH ? (
                <div className="alias_length_warning roboto_font">
                  Alias must be at least 3 characters long
                </div>
              ) : (
                <></>
              )}
              <input
                hidden={true}
                onChange={() => {}}
                value={urlDestination}
                name="url_destination"
              />
              <InlineWidthInputSubmit
                label="SUBMIT"
                disabled={
                  !trimmedAlias || trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH
                }
              />
            </fieldset>
            {loaded && badRequest ? (
              <div className="warning_alert roboto_font">
                Update user failed: {data.error}
              </div>
            ) : (
              <></>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
export { RegisterPlayerPage };
