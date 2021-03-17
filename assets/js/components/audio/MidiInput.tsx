import React, { useState } from "react";
import { useToneAudioContext } from "../../hooks";
import { MaterialIcon } from "../common";
import { Input } from "webmidi";

interface MidiInputProps {
  input: Input;
  toggleEnabled: (input: Input, turningOn: boolean) => void;
  startEnabled?: boolean;
}

const MidiInput: React.FC<MidiInputProps> = ({
  input,
  toggleEnabled,
  startEnabled = true,
}) => {
  const [enabled, setEnabled] = useState<boolean>(startEnabled);
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
        <MaterialIcon iconName="usb" style={{ color: "green" }} />
      ) : (
        <MaterialIcon iconName="usb_off" style={{ color: "red" }} />
      )}
      {input.name}
    </div>
  );
};
export { MidiInput };
