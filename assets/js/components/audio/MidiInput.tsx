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
    <div
      style={{ height: "20px" }}
      className={enabled ? "midi_button" : "midi_button button_disabled"}
      onClick={() => {
        const toggled = !enabled;
        setEnabled(toggled);
        toggleEnabled(input, toggled);
      }}
    >
      {enabled ? (
        <span
          style={{ width: "20px", marginRight: "8px", color: "green" }}
          uk-icon="icon: check; ratio: 1.4"
        ></span>
      ) : (
        <span
          style={{ width: "20px", marginRight: "8px", color: "red" }}
          uk-icon="icon: ban; ratio: 1.2"
        ></span>
      )}
      {input.name}
    </div>
  );
};
export { MidiInput };
