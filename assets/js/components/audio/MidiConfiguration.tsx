import React, { useState, useEffect } from "react";
import { Input } from "webmidi";
import { MidiInput } from "./";

interface MidiConfigurationProps {
  setDisabledMidiInputIds: Function;
  disabledMidiInputIds: string[];
  setMidiInputs: Function;
  originalMidiInputs: Input[];
}

const MidiConfiguration: React.FC<MidiConfigurationProps> = ({
  setDisabledMidiInputIds,
  disabledMidiInputIds,
  setMidiInputs,
  originalMidiInputs,
}) => {
  const toggleInputEnabled = (input: Input, turningOn: boolean): void => {
    if (turningOn) {
      const idx = disabledMidiInputIds.findIndex(
        (inputId) => inputId === input.id
      );
      disabledMidiInputIds.splice(idx, 1);
      setDisabledMidiInputIds(disabledMidiInputIds);
      setMidiInputs(
        originalMidiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    } else {
      disabledMidiInputIds.push(input.id);
      setDisabledMidiInputIds(disabledMidiInputIds);
      setMidiInputs(
        originalMidiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    }
  };

  return (
    <div>
      {!!originalMidiInputs && originalMidiInputs.length > 0 ? (
        <div className="midi_button_group">
          {originalMidiInputs
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((originalMidiInput, idx) => (
              <MidiInput
                key={`midi-input-${idx}`}
                input={originalMidiInput}
                toggleEnabled={toggleInputEnabled}
                startEnabled={
                  !disabledMidiInputIds.includes(originalMidiInput.id)
                }
              />
            ))}
        </div>
      ) : (
        <p>No MIDI Inputs found.</p>
      )}
    </div>
  );
};
export { MidiConfiguration };
