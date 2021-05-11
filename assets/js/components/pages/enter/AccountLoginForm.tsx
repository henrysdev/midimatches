import React, { useEffect, useState, useMemo } from "react";

import { AccountLoginPayload } from "../../../types";
import {
  MAX_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_ALIAS_LENGTH,
  MIN_PLAYER_PASSWORD_LENGTH,
  MAX_PLAYER_PASSWORD_LENGTH,
} from "../../../constants";
import {
  MediumLargeTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
} from "../../common";
import { useLoadAccountLogin } from "../../../hooks";

interface AccountLoginFormProps {
  setReadyToContinue: Function;
}

const AccountLoginForm: React.FC<AccountLoginFormProps> = ({
  setReadyToContinue,
}) => {
  const [alias, setAlias] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleAliasChange = (e: any) => {
    setAlias(e.target.value);
  };
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };
  const trimmedAlias = useMemo(() => {
    return alias.trim();
  }, [alias]);

  const requestBody = useMemo((): AccountLoginPayload => {
    return {
      username: trimmedAlias,
      password: password.substring(0, MAX_PLAYER_PASSWORD_LENGTH),
    };
  }, [trimmedAlias, password]);

  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadAccountLogin();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded) {
      setReadyToContinue(true);
    }
  }, [loaded, loadError, httpStatus]);

  const submitDisabled = useMemo(() => {
    return !trimmedAlias || !password;
  }, [trimmedAlias, password]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <div>
      <MediumLargeTitle>
        <span className="accent_bars">///</span>ACCOUNT LOGIN
      </MediumLargeTitle>
      <div className="register_content_wrapper inset_3d_border_deep inline_screen">
        {loading ? (
          <VinylLoadingSpinner />
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
              <label className="roboto_font">Username</label>
              <br />
              <input
                className="inline_width_text_input roboto_font"
                type="text"
                id="username"
                name="username"
                placeholder="Enter player name..."
                maxLength={MAX_PLAYER_ALIAS_LENGTH}
                onChange={handleAliasChange}
              />
            </fieldset>
            <br />
            <fieldset>
              <label style={{ marginBottom: 4 }} className="roboto_font">
                Password
              </label>
              <input
                className="inline_width_text_input roboto_font"
                type="password"
                id="password"
                name="password"
                placeholder="Enter password..."
                maxLength={MAX_PLAYER_PASSWORD_LENGTH}
                onChange={handlePasswordChange}
              />
            </fieldset>

            {badRequest ? (
              <div className="warning_alert roboto_font">
                Sign in failed: {`${httpStatus} ${JSON.stringify(data)}`}
              </div>
            ) : (
              <></>
            )}
            <InlineWidthInputSubmit label="SIGN IN" disabled={submitDisabled} />
          </form>
        )}
      </div>
    </div>
  );
};
export { AccountLoginForm };
