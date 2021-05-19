import React, { useEffect, useState, useMemo } from "react";

import { RecoverAccountPayload } from "../../../types";
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
import { useLoadAccountRecovery } from "../../../hooks";

interface RecoverAccountFormProps {
  setReadyToContinue: Function;
}

const RecoverAccountForm: React.FC<RecoverAccountFormProps> = ({
  setReadyToContinue,
}) => {
  const [alias, setAlias] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const handleAliasChange = (e: any) => {
    setAlias(e.target.value);
  };
  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const trimmedAlias = useMemo(() => {
    return alias.trim();
  }, [alias]);

  const requestBody = useMemo((): RecoverAccountPayload => {
    return {
      username: trimmedAlias,
      email: email,
    };
  }, [trimmedAlias, email]);

  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadAccountRecovery();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded) {
      setBadRequest(false);
      setReadyToContinue(true);
    }
  }, [loaded, loadError, httpStatus]);

  const { submitDisabled } = useMemo(() => {
    const missingFieldViolation = !trimmedAlias || !email;
    const violations = [missingFieldViolation];
    const submitDisabled = violations.some((x) => !!x);

    return {
      submitDisabled,
    };
  }, [trimmedAlias, email]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <div>
      <MediumLargeTitle>
        <span className="accent_bars">///</span>ACCOUNT RECOVERY
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
              <label className="roboto_font">Account Username</label>
              <br />
              <input
                className="inline_width_text_input roboto_font"
                type="text"
                id="username"
                name="username"
                placeholder="Username on the account..."
                maxLength={MAX_PLAYER_ALIAS_LENGTH}
                onChange={handleAliasChange}
              />
            </fieldset>
            <br />
            <fieldset>
              <label className="roboto_font">Account Email</label>
              <input
                className="inline_width_text_input roboto_font"
                type="text"
                id="email"
                name="email"
                placeholder="Email on the account..."
                onChange={handleEmailChange}
              />
            </fieldset>

            {badRequest ? (
              <div className="warning_alert roboto_font">
                Recover account failed:{" "}
                {`${httpStatus} ${JSON.stringify(data)}`}
              </div>
            ) : (
              <></>
            )}
            <div className="developer_about_tagline_flex_wrapper">
              <div className="developer_about_tagline text_light">
                <strong>Note:</strong> Reset emails may take several minutes to
                arrive. Remember to check spam.
              </div>
            </div>
            {!!loaded ? (
              <div className="success_alert roboto_font">
                An email with a password reset link has been sent. Follow the
                instructions in this email to finish resetting your password.
              </div>
            ) : (
              <InlineWidthInputSubmit
                label="SEND RESET EMAIL"
                disabled={submitDisabled}
              />
            )}
          </form>
        )}
      </div>
    </div>
  );
};
export { RecoverAccountForm };
