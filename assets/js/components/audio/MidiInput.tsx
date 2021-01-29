import React, { useState } from "react";
import { useToneAudioContext } from "../../hooks";
import { Input } from "webmidi";

interface MidiInputProps {
  input: Input;
  toggleEnabled: (input: Input, turningOn: boolean) => void;
}

const MidiInput: React.FC<MidiInputProps> = ({ input, toggleEnabled }) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  return (
    <button
      className={"uk-text-left uk-button uk-button-default"}
      style={
        enabled
          ? { width: "100%" }
          : { width: "100%", backgroundColor: "#c9c9c9" }
      }
      onClick={() => {
        const toggled = !enabled;
        setEnabled(toggled);
        toggleEnabled(input, toggled);
      }}
    >
      {input.name}
      {enabled ? (
        <span
          style={{ marginLeft: "8px", color: "green" }}
          uk-icon="icon: check; ratio: 1.4"
        ></span>
      ) : (
        <span
          style={{ marginLeft: "8px", color: "red" }}
          uk-icon="icon: ban; ratio: 1.2"
        ></span>
      )}
    </button>
  );
};
export { MidiInput };
