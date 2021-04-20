import _ from "lodash";
import React, { useEffect, useState, useMemo } from "react";
import { Input } from "webmidi";

import { Keyboard } from ".";
import { MIDINoteEvent, GameRules, Milliseconds } from "../../types";
import {
  useToneAudioContext,
  useNoteRecorder,
  useKeyboardInputContext,
} from "../../hooks";
import * as Tone from "tone";
import { ArrowButton } from "../common";
import {
  MIN_C_OCTAVE,
  MIDDLE_C_OCTAVE,
  MAX_C_OCTAVE,
  MIN_NOTE_NUMBER,
  MAX_NOTE_NUMBER,
} from "../../constants";
import { MidiNumbers, KeyboardShortcuts } from "../reactpiano";

interface RecordMidiProps {
  submitRecording: Function;
  sampleStartPlayCallback: Function;
  stopSample: Function;
  setIsRecording: Function;
  roundRecordingStartTime: Milliseconds;
  gameRules: GameRules;
  shouldRecord: boolean;
  hideKeyboard?: boolean;
  isRecording: boolean;
  setIsSamplePlaying: Function;
}

const RecordMidi: React.FC<RecordMidiProps> = ({
  submitRecording,
  sampleStartPlayCallback,
  stopSample,
  setIsRecording,
  roundRecordingStartTime,
  gameRules,
  shouldRecord,
  hideKeyboard = false,
  isRecording,
  setIsSamplePlaying,
}) => {
  const { midiInputs, synth, currInputLagComp } = useToneAudioContext();
  const {
    disableKeyboardInput,
    showKeyboardLabels,
  } = useKeyboardInputContext();

  const {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
    stopAllActiveNotes,
  } = useNoteRecorder({
    submitRecording,
    sampleStartPlayCallback,
    setIsRecording,
    roundRecordingStartTime,
    gameRules,
    shouldRecord,
    setIsSamplePlaying,
  });

  const stopNotes = () => {
    [...Array(200).keys()].forEach((midiNumber) => {
      const noteName = noteNumberToNoteName(midiNumber);
      synth.triggerRelease(noteName);
    });
    stopAllActiveNotes();
  };

  // init on load
  useEffect(() => {
    // TODO use ref so left arrow and right arrow event listeners work as desired
    window.addEventListener("keydown", onKeyDown);
    Tone.start();
    return () => {
      stopSample();
      stopNotes();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // init midi event listeners on initial render
  useEffect(() => {
    midiInputs.forEach((input: Input) => {
      input.addListener("noteon", "all", (event) => handleNoteOn(event));
      input.addListener("noteoff", "all", (event) => handleNoteOff(event));
    });
    return () => {
      midiInputs.forEach((input: Input) => {
        input.removeListener("noteon", "all");
        input.removeListener("noteoff", "all");
      });
    };
  }, [midiInputs]);

  const [currOctave, setCurrOctave] = useState<number>(MIDDLE_C_OCTAVE);

  const decrOctave = () => {
    stopNotes();
    setCurrOctave((prev) => (prev > MIN_C_OCTAVE ? prev - 1 : prev));
  };
  const incrOctave = () => {
    stopNotes();
    setCurrOctave((prev) => (prev < MAX_C_OCTAVE ? prev + 1 : prev));
  };

  const keyboardShortcuts = useMemo(() => {
    return KeyboardShortcuts.create({
      firstNote: MidiNumbers.fromNote(`c${currOctave}`),
      lastNote: MidiNumbers.fromNote(`c${currOctave + 2}`),
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
  }, [currOctave]);

  const stopNote = (midiNumber: number) => {
    if (!!synth) {
      const { noteNumber } = stopRecordedNote(midiNumber);
      const noteName = noteNumberToNoteName(noteNumber);
      synth.triggerRelease(noteName);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        decrOctave();
        return;
      case "ArrowRight":
        incrOctave();
        return;
      default:
        return;
    }
  };

  return (
    <div>
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
            disableKeyboardInput ||
            hideKeyboard ||
            currOctave === MIN_C_OCTAVE ||
            !showKeyboardLabels
          }
          styles={{ color: "yellow" }}
        />
        <div
          style={{
            display: "inline-block",
            width: "100%",
            height: 120,
          }}
        >
          <Keyboard
            activeMidiList={activeMidiList}
            playNote={(midiNumber: number) => {
              if (
                midiNumber >= MIN_NOTE_NUMBER &&
                midiNumber <= MAX_NOTE_NUMBER &&
                !!synth
              ) {
                const { noteNumber, noteVelocity } = playRecordedNote(
                  midiNumber
                );
                const noteName = noteNumberToNoteName(noteNumber);
                synth.triggerAttack(noteName, "+0", noteVelocity);
              }
            }}
            stopNote={stopNote}
            hideKeyboard={hideKeyboard}
            disableKeyboardInput={disableKeyboardInput}
            isRecording={isRecording}
            keyboardShortcuts={keyboardShortcuts}
            showKeyboardLabels={showKeyboardLabels}
          />
        </div>
        <ArrowButton
          left={false}
          callback={() => incrOctave()}
          hidden={
            disableKeyboardInput ||
            hideKeyboard ||
            currOctave === MAX_C_OCTAVE ||
            !showKeyboardLabels
          }
          styles={{ color: "yellow" }}
        />
      </div>
    </div>
  );
};
export { RecordMidi };

function noteNumberToNoteName(midiNoteId: number): string {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2;
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}
