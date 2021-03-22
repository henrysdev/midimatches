import React from "react";
import { Piano, MidiNumbers } from "../reactpiano";
import { MIN_C_OCTAVE, MAX_C_OCTAVE } from "../../constants";

const noteRange = {
  first: MidiNumbers.fromNote(`c${MIN_C_OCTAVE}`),
  last: MidiNumbers.fromNote(`c${MAX_C_OCTAVE + 1}`),
};

interface KeyboardProps {
  activeMidiList: number[];
  playNote: Function;
  stopNote: Function;
  hideKeyboard?: boolean;
  disableKeyboardInput?: boolean;
  isRecording: boolean;
  keyboardShortcuts: any;
  showKeyboardLabels: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({
  activeMidiList,
  playNote,
  stopNote,
  keyboardShortcuts,
  showKeyboardLabels,
  hideKeyboard = false,
  disableKeyboardInput = false,
  isRecording = false,
}) => {
  return (
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
      showNoteLabels={showKeyboardLabels}
      width={512}
    />
  );
};
export { Keyboard };
