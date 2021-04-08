import { useState, useEffect } from "react";
import { useCookies } from ".";
import { KeyboardInputContextType } from "../types";
import { SHOW_KEYBOARD_LABELS_COOKIE } from "../constants";

export function useKeyboardInputContextProvider(): KeyboardInputContextType {
  const { getCookie, hasCookie, setCookie } = useCookies();

  const [disableKeyboardInput, setDisableKeyboardInput] = useState<boolean>(
    false
  );
  const [showKeyboardLabels, _setShowKeyboardLabels] = useState<boolean>(true);

  const setShowKeyboardLabels = (showLabels: boolean): void => {
    console.log({
      showLabels,
    });
    setCookie(SHOW_KEYBOARD_LABELS_COOKIE, showLabels);
    _setShowKeyboardLabels(showLabels);
  };

  useEffect(() => {
    const showKeyLabelsStr = hasCookie(SHOW_KEYBOARD_LABELS_COOKIE)
      ? getCookie(SHOW_KEYBOARD_LABELS_COOKIE)
      : "false";
    setShowKeyboardLabels(showKeyLabelsStr === "true");
  }, []);

  return {
    showKeyboardLabels,
    setShowKeyboardLabels,
    disableKeyboardInput,
    setDisableKeyboardInput,
  };
}
