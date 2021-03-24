import React, { useState, useEffect } from "react";
import { Channel } from "phoenix";
import { unmarshalBody } from "../../utils";
import {
  DEFAULT_ALERT_LIFETIME,
  ADMIN_ALERT_MESSAGE_EVENT,
} from "../../constants";
import { MediumLargeTitle } from "../common";
import { Milliseconds } from "../../types";

interface ModalProps {
  title?: string;
  timeout?: Milliseconds;
  children?: any;
  onCloseModal?: Function;
}
const Modal: React.FC<ModalProps> = ({
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
        <div className="modal relative_anchor">
          <div className="modal_content centered_div">
            <span onClick={closeModal} className="modal_close">
              &times;
            </span>
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
export { Modal };
