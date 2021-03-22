import React, { useMemo, useState } from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "../reactpiano";
import { ArrowButton } from "../common";
import { MIN_C_OCTAVE, MIDDLE_C_OCTAVE, MAX_C_OCTAVE } from "../../constants";

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
}

const Keyboard: React.FC<KeyboardProps> = ({
  activeMidiList,
  playNote,
  stopNote,
  hideKeyboard = false,
  disableKeyboardInput = false,
  isRecording = false,
}) => {
  const [currOctave, setCurrOctave] = useState<number>(MIDDLE_C_OCTAVE);

  // TODO must stop midi notes as well
  const stopAllActiveNotes = () => {
    for (var i = 0; i <= 112; i++) {
      stopNote(i);
    }
  };

  const decrOctave = () => {
    stopAllActiveNotes();
    setCurrOctave((prev) => (prev > MIN_C_OCTAVE ? prev - 1 : prev));
  };
  const incrOctave = () => {
    stopAllActiveNotes();
    setCurrOctave((prev) => (prev < MAX_C_OCTAVE ? prev + 1 : prev));
  };

  const keyboardShortcuts = useMemo(() => {
    return KeyboardShortcuts.create({
      firstNote: MidiNumbers.fromNote(`c${currOctave}`),
      lastNote: MidiNumbers.fromNote(`c${currOctave + 2}`),
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
  }, [currOctave]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px",
      }}
    >
      <ArrowButton
        left={true}
        callback={() => decrOctave()}
        hidden={
          disableKeyboardInput || hideKeyboard || currOctave === MIN_C_OCTAVE
        }
        styles={{ color: "yellow" }}
      />
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
      <ArrowButton
        left={false}
        callback={() => incrOctave()}
        hidden={
          disableKeyboardInput || hideKeyboard || currOctave === MAX_C_OCTAVE
        }
        styles={{ color: "yellow" }}
      />
    </div>
  );
};
export { Keyboard };
