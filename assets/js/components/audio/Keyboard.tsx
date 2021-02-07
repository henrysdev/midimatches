import React from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "react-piano";

const noteRange = {
  first: MidiNumbers.fromNote("c3"),
  last: MidiNumbers.fromNote("c5"),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

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
        <Piano
          noteRange={noteRange}
          keyboardShortcuts={keyboardShortcuts}
          activeNotes={activeMidiList}
          playNote={(midiNumber: number) => playNote(midiNumber)}
          stopNote={(midiNumber: number) => stopNote(midiNumber)}
          width={400}
        />
      </div>
    </div>
  );
};
export { Keyboard };
