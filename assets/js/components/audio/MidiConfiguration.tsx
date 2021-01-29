import React, { useState, useEffect } from "react";
import { Input } from "webmidi";
import { MidiInput } from "./";
import { useWebMidi } from "../../hooks";

interface MidiConfigurationProps {
  setMidiInputs: Function;
}

const MidiConfiguration: React.FC<MidiConfigurationProps> = ({
  setMidiInputs,
}) => {
  const [midiInputs] = useWebMidi();
  const [disabledMidiInputIds, setDisabledMidiInputIds] = useState<
    Array<string>
  >([]);

  useEffect(() => {
    if (!!midiInputs) {
      setMidiInputs(
        midiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    }
  }, [midiInputs]);

  const toggleInputEnabled = (input: Input, turningOn: boolean): void => {
    if (turningOn) {
      const idx = disabledMidiInputIds.findIndex(
        (inputId) => inputId === input.id
      );
      disabledMidiInputIds.splice(idx, 1);
      setDisabledMidiInputIds(disabledMidiInputIds);
      setMidiInputs(
        midiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    } else {
      disabledMidiInputIds.push(input.id);
      setDisabledMidiInputIds(disabledMidiInputIds);
      setMidiInputs(
        midiInputs.filter(
          (input: Input) => !disabledMidiInputIds.includes(input.id)
        )
      );
    }
  };

  return (
    <div>
      <h4>Found MIDI Inputs (click an input to toggle disable)</h4>
      {!!midiInputs ? (
        <ul
          style={{
            maxHeight: "200px",
            overflow: "scroll",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          {midiInputs
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((midiInput) => (
              <MidiInput
                key={`midi-input-${midiInput.id}`}
                input={midiInput}
                toggleEnabled={toggleInputEnabled}
              />
            ))}
        </ul>
      ) : (
        <div>No MIDI Inputs found</div>
      )}
    </div>
  );
};
export { MidiConfiguration };
