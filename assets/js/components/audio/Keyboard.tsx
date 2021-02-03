import React from "react";
import { ControlledPiano, MidiNumbers } from "react-piano";

interface KeyboardProps {
  activeMidiList: number[];
  playNote: Function;
  stopNote: Function;
}

const Keyboard: React.FC<KeyboardProps> = ({
  activeMidiList,
  playNote,
  stopNote,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px",
      }}
    >
      <div
        style={{
          display: "inline-block",
        }}
      >
        <ControlledPiano
          noteRange={{
            first: MidiNumbers.fromNote("c3"),
            last: MidiNumbers.fromNote("c5"),
          }}
          activeNotes={activeMidiList}
          playNote={(midiNumber: number) => playNote(midiNumber)}
          stopNote={(midiNumber: number) => stopNote(midiNumber)}
          onPlayNoteInput={() => {}}
          onStopNoteInput={() => {}}
          width={400}
        />
      </div>
    </div>
  );
};
export { Keyboard };
