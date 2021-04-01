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
import {
  useLoadUpdateUser,
  useCurrentUserContext,
  useSocketContext,
} from "../../../hooks";
import { PageWrapper } from "../";

const RegisterPlayerPage: React.FC = () => {
  const [alias, setAlias] = useState<string>("");
  const [urlDestination, setUrlDestination] = useState<string>("/menu");

  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();

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

  const { submitDisabled, showAliasLengthRule } = useMemo(() => {
    const submitDisabled =
      !trimmedAlias || trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH;
    const showAliasLengthRule =
      submitDisabled && !!trimmedAlias && trimmedAlias.length > 0;
    return { submitDisabled, showAliasLengthRule };
  }, [trimmedAlias]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <div className="narrow_center_container computer_frame outset_3d_border_deep">
        <br />
        <MediumLargeTitle>
          <span className="accent_bars">///</span>PICK A NAME
        </MediumLargeTitle>
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
                  handleSubmitForm(e);
                }
              }}
              onSubmit={(e: any) => {
                e.stopPropagation();
                handleSubmitForm(e);
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
                {showAliasLengthRule ? (
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
                  disabled={submitDisabled}
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
    </PageWrapper>
  );
};
export { RegisterPlayerPage };
