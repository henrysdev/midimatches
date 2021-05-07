import React, { useEffect, useState, useMemo } from "react";

import { UpdateUserPayload } from "../../../types";
import {
  MAX_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_ALIAS_LENGTH,
} from "../../../constants";
import {
  MediumLargeTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
} from "../../common";
import { useLoadUpdateUser } from "../../../hooks";

interface PlayWithoutSaveFormProps {
  setReadyToContinue: Function;
}

const PlayWithoutSaveForm: React.FC<PlayWithoutSaveFormProps> = ({
  setReadyToContinue,
}) => {
  const [alias, setAlias] = useState<string>("");

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
      setReadyToContinue(true);
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
    <div>
      <MediumLargeTitle>
        <span className="accent_bars">///</span>PLAY WITHOUT SAVE
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
                  {`Username must be at least ${MIN_PLAYER_ALIAS_LENGTH} characters long`}
                </div>
              ) : (
                <></>
              )}
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
  );
};
export { PlayWithoutSaveForm };
