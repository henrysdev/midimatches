import _ from "lodash";
import React, { useEffect } from "react";
import { Input } from "webmidi";

import { Keyboard } from ".";
import { MIDINoteEvent, GameRules } from "../../types";
import { useToneAudioContext, useNoteRecorder } from "../../hooks";

interface RecordMidiProps {
  submitRecording: Function;
  playSample: Function;
  stopSample: Function;
  setIsRecording: Function;
  roundRecordingStartTime: number;
  gameRules: GameRules;
  shouldRecord: boolean;
}

const RecordMidi: React.FC<RecordMidiProps> = ({
  submitRecording,
  playSample,
  stopSample,
  setIsRecording,
  roundRecordingStartTime,
  gameRules,
  shouldRecord,
}) => {
  const { midiInputs, synth } = useToneAudioContext();

  const {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
  } = useNoteRecorder({
    submitRecording,
    playSample,
    setIsRecording,
    roundRecordingStartTime,
    gameRules,
    shouldRecord,
  });

  // init on load
  useEffect(() => {
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
