import React, { useEffect, useState, useMemo } from "react";

import { UpdatePasswordPayload } from "../../../types";
import {
  MIN_PLAYER_PASSWORD_LENGTH,
  MAX_PLAYER_PASSWORD_LENGTH,
} from "../../../constants";
import {
  MediumLargeTitle,
  InlineWidthInputSubmit,
  VinylLoadingSpinner,
  MediumTitle,
} from "../../common";
import { useLoadDeleteAccount, useCurrentUserContext } from "../../../hooks";

interface DeleteAccountFormProps {}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({}) => {
  const { user: currentUser } = useCurrentUserContext();
  const [password, setPassword] = useState<string>("");

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };

  const requestBody = useMemo((): UpdatePasswordPayload => {
    return {
      password: password.substring(0, MAX_PLAYER_PASSWORD_LENGTH),
    };
  }, [password]);

  const { submitDisabled } = useMemo(() => {
    const missingFieldViolation = !password;

    const violations = [missingFieldViolation];

    const submitDisabled = violations.some((x) => !!x);
    return {
      submitDisabled,
    };
  }, [password]);

  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadDeleteAccount();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded) {
      setBadRequest(false);
      window.location.href = "/enter";
    }
  }, [loaded, loadError, httpStatus]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(currentUser.userId, requestBody);
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--extra_danger_bg_color)",
        borderRadius: "10px",
      }}
    >
      <MediumTitle
        extraStyles={{
          paddingLeft: "8px",
          paddingTop: "8px",
        }}
        centered={false}
      >
        DELETE ACCOUNT
      </MediumTitle>
      <div className="register_content_wrapper inset_3d_border_deep inline_screen">
        {loading || loaded ? (
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
              {badRequest ? (
                <div className="warning_alert roboto_font">
                  Delete account failed:{" "}
                  {`${httpStatus} ${JSON.stringify(data)}`}
                </div>
              ) : (
                <></>
              )}
            </fieldset>
            <InlineWidthInputSubmit
              extraStyles={{
                color: "var(--extra_danger_bg_color)",
              }}
              label="DELETE ACCOUNT"
              disabled={submitDisabled}
            />
          </form>
        )}
      </div>
    </div>
  );
};
export { DeleteAccountForm };
