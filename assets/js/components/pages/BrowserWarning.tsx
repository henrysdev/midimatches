import React, { useMemo, useEffect, useState } from "react";
import {
  isChromium,
  browserName,
  isEdgeChromium,
  isEdge,
  isChrome,
  isOpera,
  isFirefox,
  isSafari,
  isIE,
} from "react-device-detect";
import { Modal } from "../common";
import { useCookies } from "../../hooks";
import { SEEN_BROWSER_WARNING_COOKIE } from "../../constants";

const BrowserWarning: React.FC = ({}) => {
  const [supportedBrowser, setSupportedBrowser] = useState<boolean>(true);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const { hasCookie, setCookie } = useCookies();
  useEffect(() => {
    const supported =
      isChromium || isChrome || isEdge || isEdgeChromium || isOpera;
    setSupportedBrowser(supported);
  }, [browserName]);

  useEffect(() => {
    if (!supportedBrowser && !hasCookie(SEEN_BROWSER_WARNING_COOKIE)) {
      setShowWarningModal(true);
      setCookie(SEEN_BROWSER_WARNING_COOKIE, true);
    }
  }, [supportedBrowser]);

  return showWarningModal ? (
    <Modal title="Browser Warning">
      <div className="browser_warning_content_wrapper">
        <div>
          <p className="centered_text" style={{ color: "red" }}>
            <strong>
              Unsupported Browser Detected - Proceed at your own risk!
            </strong>
          </p>
        </div>
        <p>
          It looks like you're using a browser that is not currently supported
          for playing Midi Matches. For the optimal experience, try using one of
          the following browsers:
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
          (+ other modern, chromium-based desktop browsers)
        </p>
      </div>
    </Modal>
  ) : (
    <></>
  );
};

export { BrowserWarning };
