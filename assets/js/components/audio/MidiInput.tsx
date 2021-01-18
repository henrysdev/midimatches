import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import WebMidi from "webmidi";

import { Keyboard } from ".";
import { DEFAULT_SYNTH_CONFIG } from "../../constants";
import { Loop, MIDINoteEvent, Note, TimestepSlice } from "../../types";
import { SimpleButton } from "../common";
import { useGameContext, useToneAudioContext } from "../../hooks";

interface MidiInputProps {
  submitRecording: Function;
}

export interface MidiInputState {
  activeNotes: Map<number, MIDINoteEvent>;
  recordingStartTimestep: number;
  recordedTimesteps: Map<number, TimestepSlice>;
  synth: any;
  isRecording: boolean;
  gameContext: Object;
}

const MidiInput: React.FC<MidiInputProps> = ({ submitRecording }) => {
  const { Tone } = useToneAudioContext();

  const [midiInputState, _setMidiInputState] = useState<MidiInputState>(
    {} as MidiInputState
  );
  const midiInputStateRef = useRef({});
  const setMidiInputState = (data: any) => {
    const updatedInputState = { ...midiInputStateRef.current, ...data };
    midiInputStateRef.current = updatedInputState;
    _setMidiInputState(updatedInputState);
  };

  // game context event listener closure workaround
  const consumedGameContext = useGameContext();
  useEffect(() => {
    setMidiInputState({ gameContext: consumedGameContext });
  }, [consumedGameContext]);

  // init on load
  useEffect(() => {
    const niceSynth = new Tone.Synth(DEFAULT_SYNTH_CONFIG).toDestination();
    Tone.context.lookAhead = 0.02;

    setMidiInputState({
      activeNotes: new Map(),
      recordedTimesteps: new Map(),
      synth: niceSynth,
    });
  }, []);

  const startRecord = (): void => {
    const { gameContext } = midiInputState;
    const currTimestep = getCurrentTimestep(gameContext);
    setMidiInputState({
      isRecording: true,
      recordingStartTimestep: currTimestep,
    });
  };

  const stopRecord = (): void => {
    const {
      recordedTimesteps,
      recordingStartTimestep,
      gameContext,
    } = midiInputState;
    const timestepSlices = Array.from(recordedTimesteps.values()).sort(
      (a, b) => a.timestep - b.timestep
    );
    const currTimestep: number = getCurrentTimestep(gameContext);
    const length = currTimestep - recordingStartTimestep;

    // TODO format in a utility method rather than writing snake case here
    const loop = {
      timestep_slices: timestepSlices,
      start_timestep: recordingStartTimestep,
      length: length,
    };
    submitRecording(loop);
    setMidiInputState({ recordedTimesteps: new Map(), isRecording: false });
  };

  // init midi access on first render
  useEffect(() => {
    WebMidi.enable((error) => {
      if (error) {
        console.warn("WebMidi could not be enabled.");
        return;
      } else {
        WebMidi.inputs.forEach((input) => {
          input.addListener("noteon", "all", (event) => handleNoteOn(event));
          input.addListener("noteoff", "all", (event) => handleNoteOff(event));
        });
      }
      console.log("WebMidi enabled.");
      if (WebMidi.inputs.length === 0) {
        // TODO handle properly
        console.log("No MIDI inputs.");
        return;
      }
    });
  }, []);

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOn = (midiEvent: any) => {
    const {
      gameContext,
      activeNotes,
    } = midiInputStateRef.current as MidiInputState;
    const currTimestep = getCurrentTimestep(gameContext);
    const noteOnEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    console.log("note On event: ", noteOnEvent);
    const activeNotesCopy = _.cloneDeep(activeNotes);
    activeNotesCopy.set(noteOnEvent.value, noteOnEvent);
    setMidiInputState({ activeNotes: activeNotesCopy });
  };

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOff = (midiEvent: any) => {
    const {
      gameContext,
      activeNotes,
      recordedTimesteps = new Map(),
      isRecording,
    } = midiInputStateRef.current as MidiInputState;
    let stateUpdate = {};
    const currTimestep = getCurrentTimestep(gameContext);
    const noteOffEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    const activeNotesCopy = _.cloneDeep(activeNotes);
    if (activeNotesCopy.has(noteOffEvent.value)) {
      const noteOnEvent = activeNotesCopy.get(noteOffEvent.value);
      const {
        value: key_,
        receivedTimestep: startTimestep,
      } = noteOnEvent as MIDINoteEvent;

      // update recorded timestep slice with new note
      if (isRecording) {
        const newNote: Note = {
          instrument: "abc",
          key: key_,
          duration: Math.max(
            1,
            Math.abs(startTimestep - noteOffEvent.receivedTimestep)
          ),
        };
        const updatedNotes = recordedTimesteps.has(startTimestep)
          ? [newNote].concat(recordedTimesteps.get(startTimestep).notes)
          : [newNote];
        const updatedTimestepSlice = {
          timestep: startTimestep,
          notes: updatedNotes,
        };
        stateUpdate = {
          ...stateUpdate,
          recordedTimesteps: recordedTimesteps.set(
            startTimestep,
            updatedTimestepSlice
          ),
        };
      }

      activeNotesCopy.delete(noteOffEvent.value);
      setMidiInputState({ ...stateUpdate, activeNotes: activeNotesCopy });
    }
  };

  const activeMidiList = !!midiInputState.activeNotes
    ? Array.from(midiInputState.activeNotes.keys())
    : [];

  return (
    <div>
      <Keyboard
        activeMidiList={activeMidiList}
        playNote={(midiNumber: number) => {
          if (!!midiInputState.synth) {
            // play sound
            const noteName = midiNoteNumberToNoteName(midiNumber);
            midiInputState.synth.triggerAttackRelease(noteName, "8n");
          }
        }}
        stopNote={(midiNumber: number) => {
          console.log("key up: ", midiNumber);
        }}
      />
      <SimpleButton
        label="Start Recording"
        callback={() => startRecord()}
        disabled={midiInputState.isRecording}
      />
      <SimpleButton
        label="Stop Recording"
        callback={() => stopRecord()}
        disabled={!midiInputState.isRecording}
      />
    </div>
  );
};
export { MidiInput };

function midiNoteNumberToNoteName(midiNoteId: number): string {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2;
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}

function webMidiEventToMidiNoteEvent(
  webMidiEvent: any,
  receivedTimestep: number
): MIDINoteEvent {
  return {
    value: webMidiEvent.note.number,
    velocity: webMidiEvent.rawVelocity,
    receivedTimestep: receivedTimestep,
  } as MIDINoteEvent;
}

function getCurrentTimestep({
  roundRecordingStartTime,
  gameRules: { timestepSize, quantizationThreshold },
}: any): number {
  const nowMicros = Date.now() * 1000;
  return calculateTimestep(
    nowMicros,
    roundRecordingStartTime,
    timestepSize,
    quantizationThreshold
  );
}

function calculateTimestep(
  timeUtc: number,
  roundRecordingStartTime: number,
  timestepSize: number,
  quantizationThreshold: number
): number {
  const elapsedTime = Math.abs(timeUtc - roundRecordingStartTime);
  const elapsedTimesteps = Math.floor(elapsedTime / timestepSize);
  const remainderTime = elapsedTime % timestepSize;
  const quantizeTimestep =
    remainderTime >= quantizationThreshold * 1000 ? 1 : 0;
  return elapsedTimesteps + quantizeTimestep;
}
