import React, { useEffect, useState, useMemo } from "react";

import { CreateAccountPayload } from "../../../types";
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
import { useLoadCreateAccount } from "../../../hooks";

interface CreateAccountFormProps {
  setReadyToContinue: Function;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  setReadyToContinue,
}) => {
  const [alias, setAlias] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secondPassword, setSecondPassword] = useState<string>("");

  const handleAliasChange = (e: any) => {
    setAlias(e.target.value);
  };
  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };
  const handleSecondPasswordChange = (e: any) => {
    setSecondPassword(e.target.value);
  };

  const trimmedAlias = useMemo(() => {
    return alias.trim();
  }, [alias]);

  const requestBody = useMemo((): CreateAccountPayload => {
    return {
      username: trimmedAlias,
      password: password.substring(0, MAX_PLAYER_PASSWORD_LENGTH),
      email: email,
    };
  }, [trimmedAlias, password, email]);

  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadCreateAccount();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded) {
      setBadRequest(false);
      setReadyToContinue(true);
    }
  }, [loaded, loadError, httpStatus]);

  const {
    submitDisabled,
    showAliasLengthRule,
    showPasswordLengthRule,
    showPasswordMismatchRule,
  } = useMemo(() => {
    const usernameLengthViolation =
      trimmedAlias.length < MIN_PLAYER_ALIAS_LENGTH;
    const passwordLengthViolation =
      password.length < MIN_PLAYER_PASSWORD_LENGTH;
    const passwordMismatchViolation = password !== secondPassword;
    const missingFieldViolation =
      !trimmedAlias || !email || !password || !secondPassword;

    const violations = [
      usernameLengthViolation,
      passwordLengthViolation,
      passwordMismatchViolation,
      missingFieldViolation,
    ];

    const submitDisabled = violations.some((x) => !!x);

    const showAliasLengthRule =
      submitDisabled && !!trimmedAlias && usernameLengthViolation;
    const showPasswordLengthRule =
      submitDisabled && !!password && passwordLengthViolation;
    const showPasswordMismatchRule =
      !!password && !!secondPassword && passwordMismatchViolation;
    return {
      submitDisabled,
      showAliasLengthRule,
      showPasswordLengthRule,
      showPasswordMismatchRule,
    };
  }, [trimmedAlias, password, secondPassword]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <div>
      <MediumLargeTitle>
        <span className="accent_bars">///</span>CREATE ACCOUNT
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
              {showAliasLengthRule ? (
                <div className="alias_length_warning roboto_font">
                  {`Username must be at least ${MIN_PLAYER_ALIAS_LENGTH} characters long`}
                </div>
              ) : (
                <></>
              )}
            </fieldset>
            <br />
            <fieldset>
              <label className="roboto_font">Email (for password resets)</label>
              <input
                className="inline_width_text_input roboto_font"
                type="text"
                id="email"
                name="email"
                placeholder="Enter email..."
                onChange={handleEmailChange}
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
              {showPasswordLengthRule ? (
                <div className="alias_length_warning roboto_font">
                  {`Password must be at least ${MIN_PLAYER_PASSWORD_LENGTH} characters long`}
                </div>
              ) : (
                <></>
              )}
            </fieldset>
            <br />
            <fieldset>
              <label className="roboto_font">Confirm Password</label>
              <input
                className="inline_width_text_input roboto_font"
                type="password"
                id="password_confirm"
                name="password_confirm"
                placeholder="Confirm password..."
                maxLength={MAX_PLAYER_PASSWORD_LENGTH}
                onChange={handleSecondPasswordChange}
              />
              {showPasswordMismatchRule ? (
                <div className="alias_length_warning roboto_font">
                  {`Passwords do not match`}
                </div>
              ) : (
                <></>
              )}
            </fieldset>

            {badRequest ? (
              <div className="warning_alert roboto_font">
                Create account failed: {`${httpStatus} ${JSON.stringify(data)}`}
              </div>
            ) : (
              <></>
            )}
            {/* <div className="developer_about_tagline_flex_wrapper">
              <div className="developer_about_tagline text_light">
                <strong>Note:</strong> Email addresses are used strictly for
                account verification and password resets.
              </div>
            </div> */}
            <InlineWidthInputSubmit label="CREATE" disabled={submitDisabled} />
          </form>
        )}
      </div>
    </div>
  );
};
export { CreateAccountForm };
