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
        <i
          style={{ verticalAlign: "middle", color: "green" }}
          className="material-icons"
        >
          usb
        </i>
      ) : (
        <i
          style={{ verticalAlign: "middle", color: "red" }}
          className="material-icons"
        >
          usb_off
        </i>
      )}
      {input.name}
    </div>
  );
};
export { MidiInput };
