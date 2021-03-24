import React, { useMemo, useEffect, useState } from "react";
import {
  isChromium,
  browserName,
  isEdgeChromium,
  isEdge,
  isChrome,
  isOpera,
} from "react-device-detect";
import { BrowserCompatibilityContextType } from "../types";

export function useBrowserCompatibilityContextProvider(): BrowserCompatibilityContextType {
  const [supportedBrowser, setSupportedBrowser] = useState<boolean>(true);
  const [
    showCompatibilityWarning,
    setShowCompatibilityWarning,
  ] = useState<boolean>(false);

  useEffect(() => {
    const supported =
      isChromium || isChrome || isEdge || isEdgeChromium || isOpera;
    setSupportedBrowser(supported);
  }, [browserName]);

  return {
    supportedBrowser,
    showCompatibilityWarning,
    setShowCompatibilityWarning,
  };
}
