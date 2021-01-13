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
      width={1000}
    />
  );
};
export { Keyboard };
