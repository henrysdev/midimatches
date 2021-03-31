import React, { useState, useEffect } from "react";
import { Channel } from "phoenix";
import { unmarshalBody } from "../../utils";
import {
  DEFAULT_ALERT_LIFETIME,
  ADMIN_ALERT_MESSAGE_EVENT,
} from "../../constants";
import { MediumLargeTitle } from ".";
import { Milliseconds } from "../../types";

interface CenteredFrontWindowProps {
  title?: string;
  timeout?: Milliseconds;
  children?: any;
  onCloseModal?: Function;
}
const CenteredFrontWindow: React.FC<CenteredFrontWindowProps> = ({
  timeout,
  title,
  children,
  onCloseModal = () => {},
}) => {
  const [showModal, setShowModal] = useState<boolean>(true);

  const closeModal = () => {
    onCloseModal();
    setShowModal(false);
  };

  useEffect(() => {
    if (!!timeout && showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div>
      {showModal ? (
        <div className="front_window_modal relative_anchor">
          <div
            className="modal_content_wide centered_div computer_frame outset_3d_border_deep front_window"
            style={{ backgroundColor: "var(--main_theme_shade_1)" }}
          >
            {!!title ? (
              <div className="centered_title modal_title roboto_font">
                {title}
              </div>
            ) : (
              <></>
            )}
            {children}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
export { CenteredFrontWindow };
