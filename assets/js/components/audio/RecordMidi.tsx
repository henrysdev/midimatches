import _ from "lodash";
import React, { useEffect } from "react";
import { Input } from "webmidi";

import { Keyboard } from ".";
import { MIDINoteEvent, GameRules, Milliseconds } from "../../types";
import {
  useToneAudioContext,
  useNoteRecorder,
  useKeyboardInputContext,
} from "../../hooks";
import * as Tone from "tone";

interface RecordMidiProps {
  submitRecording: Function;
  sampleStartPlayCallback: Function;
  stopSample: Function;
  setIsRecording: Function;
  roundRecordingStartTime: Milliseconds;
  gameRules: GameRules;
  shouldRecord: boolean;
  hideKeyboard?: boolean;
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
}) => {
  const { midiInputs, synth } = useToneAudioContext();
  const { disableKeyboardInput } = useKeyboardInputContext();

  const {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
  } = useNoteRecorder({
    submitRecording,
    sampleStartPlayCallback,
    setIsRecording,
    roundRecordingStartTime,
    gameRules,
    shouldRecord,
  });

  // init on load
  useEffect(() => {
    Tone.start();
    return () => {
      stopSample();
      [...Array(200).keys()].forEach((midiNumber) => {
        const noteName = noteNumberToNoteName(midiNumber);
        synth.triggerRelease(noteName);
      });
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

  return (
    <div>
      <Keyboard
        activeMidiList={activeMidiList}
        playNote={(midiNumber: number) => {
          if (!!synth) {
            const { noteNumber, noteVelocity } = playRecordedNote(midiNumber);
            const noteName = noteNumberToNoteName(noteNumber);
            synth.triggerAttack(noteName, "+0", noteVelocity);
          }
        }}
        stopNote={(midiNumber: number) => {
          if (!!synth) {
            const { noteNumber } = stopRecordedNote(midiNumber);
            const noteName = noteNumberToNoteName(noteNumber);
            synth.triggerRelease(noteName);
          }
        }}
        hideKeyboard={hideKeyboard}
        disableKeyboardInput={disableKeyboardInput}
      />
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
