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
import { useLoadUpdatePassword } from "../../../hooks";

interface ChangePasswordFormProps {}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({}) => {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setSecondPassword] = useState<string>("");

  const handleOldPasswordChange = (e: any) => {
    setOldPassword(e.target.value);
  };
  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };
  const handleSecondPasswordChange = (e: any) => {
    setSecondPassword(e.target.value);
  };

  const requestBody = useMemo((): UpdatePasswordPayload => {
    return {
      old_password: oldPassword.substring(0, MAX_PLAYER_PASSWORD_LENGTH),
      password: password.substring(0, MAX_PLAYER_PASSWORD_LENGTH),
    };
  }, [oldPassword, password, confirmPassword]);

  const {
    submitDisabled,
    showPasswordLengthRule,
    showPasswordMismatchRule,
  } = useMemo(() => {
    const passwordLengthViolation =
      password.length < MIN_PLAYER_PASSWORD_LENGTH;
    const passwordMismatchViolation = password !== confirmPassword;
    const missingFieldViolation = !oldPassword || !password || !confirmPassword;

    const violations = [
      passwordLengthViolation,
      passwordMismatchViolation,
      missingFieldViolation,
    ];

    const submitDisabled = violations.some((x) => !!x);

    const showPasswordLengthRule =
      submitDisabled && !!password && passwordLengthViolation;
    const showPasswordMismatchRule =
      !!password && !!confirmPassword && passwordMismatchViolation;
    return {
      submitDisabled,
      showPasswordLengthRule,
      showPasswordMismatchRule,
    };
  }, [password, confirmPassword]);

  const {
    data,
    httpStatus,
    loading = false,
    loaded = false,
    loadError = false,
    submitRequest,
  } = useLoadUpdatePassword();

  const [badRequest, setBadRequest] = useState<boolean>(false);

  useEffect(() => {
    if (!!loadError && !!data) {
      setBadRequest(true);
    } else if (!!loaded) {
      setBadRequest(false);
    }
  }, [loaded, loadError, httpStatus]);

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (!submitDisabled) {
      submitRequest(requestBody);
    }
  };

  return (
    <div>
      <MediumTitle
        extraStyles={{ paddingLeft: "8px", paddingTop: "8px" }}
        centered={false}
      >
        CHANGE PASSWORD
      </MediumTitle>
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
              <label style={{ marginBottom: 4 }} className="roboto_font">
                Old Password
              </label>
              <input
                className="inline_width_text_input roboto_font"
                type="password"
                id="old_password"
                name="old_password"
                placeholder="Enter old password..."
                maxLength={MAX_PLAYER_PASSWORD_LENGTH}
                onChange={handleOldPasswordChange}
              />
            </fieldset>
            <br />
            <fieldset>
              <label style={{ marginBottom: 4 }} className="roboto_font">
                New Password
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
              <label className="roboto_font">Confirm New Password</label>
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

              {badRequest ? (
                <div className="warning_alert roboto_font">
                  Update password failed:{" "}
                  {`${httpStatus} ${JSON.stringify(data)}`}
                </div>
              ) : (
                <></>
              )}
            </fieldset>
            <InlineWidthInputSubmit
              label="CHANGE PASSWORD"
              disabled={submitDisabled}
            />
          </form>
        )}
      </div>
    </div>
  );
};
export { ChangePasswordForm };
