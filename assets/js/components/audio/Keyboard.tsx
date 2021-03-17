import React from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "../reactpiano";

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
  hideKeyboard?: boolean;
  disableKeyboardInput?: boolean;
  isRecording: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({
  activeMidiList,
  playNote,
  stopNote,
  hideKeyboard = false,
  disableKeyboardInput = false,
  isRecording = false,
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
          frozen={hideKeyboard}
          disabled={hideKeyboard}
          disableKeyboardInput={disableKeyboardInput}
          noteRange={noteRange}
          keyboardShortcuts={keyboardShortcuts}
          activeNotes={activeMidiList}
          recording={!!isRecording}
          playNote={(midiNumber: number) => playNote(midiNumber)}
          stopNote={(midiNumber: number) => stopNote(midiNumber)}
          width={512}
        />
      </div>
    </div>
  );
};
export { Keyboard };
