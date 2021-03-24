import React, { useEffect, useState } from "react";

import { Modal } from "../common";
import { useCookies, useBrowserCompatibilityContext } from "../../hooks";
import { SEEN_BROWSER_WARNING_COOKIE } from "../../constants";

const BrowserWarning: React.FC = () => {
  const {
    supportedBrowser,
    showCompatibilityWarning: forceShowWarning,
    setShowCompatibilityWarning,
  } = useBrowserCompatibilityContext();
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  // const [modalCtr, setModalCtr] = useState<number>(0);
  // const refreshModal = () => setModalCtr((prev) => prev + 1);

  const { hasCookie, setCookie } = useCookies();

  useEffect(() => {
    if (!supportedBrowser && !hasCookie(SEEN_BROWSER_WARNING_COOKIE)) {
      setShowWarningModal(true);
      setCookie(SEEN_BROWSER_WARNING_COOKIE, true);
    }
  }, [supportedBrowser]);

  // useEffect(() => {
  //   console.log("aAHAhA");
  //   refreshModal();
  // }, [forceShowWarning]);

  return showWarningModal || forceShowWarning ? (
    <Modal
      title="Browser Warning"
      onCloseModal={() => setShowCompatibilityWarning(false)}
    >
      <div className="browser_warning_content_wrapper">
        <div>
          <p className="centered_text" style={{ color: "red" }}>
            <strong>
              Unsupported Browser Detected - Proceed at your own risk
            </strong>
          </p>
        </div>
        <p>
          It looks like you're using a browser that Midi Matches does not
          currently support. For an optimal experience, try using one of the
          following browsers:
        </p>
        <div className="browser_warning_flex_anchor">
          <a
            className="supported_browser_item roboto_font"
            href="https://www.google.com/chrome/"
          >
            Chrome
          </a>
          <a
            className="supported_browser_item roboto_font"
            href="https://www.microsoft.com/en-us/edge"
          >
            Edge
          </a>
          <a
            className="supported_browser_item roboto_font"
            href="https://www.opera.com/"
          >
            Opera
          </a>
          <a
            className="supported_browser_item roboto_font"
            href="https://brave.com/download/"
          >
            Brave
          </a>
        </div>
        <p className="centered_text">
          (+ any other modern, chromium-based desktop browser)
        </p>
      </div>
    </Modal>
  ) : (
    <></>
  );
};

export { BrowserWarning };
