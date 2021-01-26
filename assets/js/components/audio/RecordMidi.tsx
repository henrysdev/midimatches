import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import WebMidi from "webmidi";

import { Keyboard } from ".";
import { DEFAULT_SYNTH_CONFIG } from "../../constants";
import {
  MIDINoteEvent,
  Note,
  TimestepSlice,
  GameContextType,
} from "../../types";
import { useGameContext, useToneAudioContext } from "../../hooks";
import {
  scheduleRecordingDeadlines,
  getRecordingStartTimestamp,
} from "../../helpers";
import { msToMicros, microsToMs } from "../../utils";

interface RecordMidiProps {
  submitRecording: Function;
  playSample: Function;
  setIsRecording: Function;
}

export interface RecordMidiState {
  activeNotes: Map<number, MIDINoteEvent>;
  recordedTimesteps: Map<number, TimestepSlice>;
  synth: any;
  isRecording: boolean;
  gameContext: GameContextType;
  recordingStartTime: number;
}

const RecordMidi: React.FC<RecordMidiProps> = ({
  submitRecording,
  playSample,
  setIsRecording,
}) => {
  const { Tone } = useToneAudioContext();

  const [recordMidiState, _setRecordMidiState] = useState<RecordMidiState>(
    {} as RecordMidiState
  );
  const recordMidiStateRef = useRef({});
  const setRecordMidiState = (data: any) => {
    const updatedInputState = { ...recordMidiStateRef.current, ...data };
    recordMidiStateRef.current = updatedInputState;
    _setRecordMidiState(updatedInputState);
  };

  // game context event listener closure workaround
  const consumedGameContext = useGameContext();
  useEffect(() => {
    setRecordMidiState({ gameContext: consumedGameContext });
  }, [consumedGameContext]);

  // init on load
  useEffect(() => {
    const niceSynth = new Tone.Synth(DEFAULT_SYNTH_CONFIG).toDestination();
    Tone.context.lookAhead = 0.02;

    setRecordMidiState({
      activeNotes: new Map(),
      recordedTimesteps: new Map(),
      synth: niceSynth,
    });
  }, []);

  const startRecord = (): void => {
    setIsRecording(true);
    const {
      gameContext: { roundRecordingStartTime },
    } = recordMidiStateRef.current as RecordMidiState;
    if (!!roundRecordingStartTime) {
      const recordingStartTime = getRecordingStartTimestamp(
        microsToMs(roundRecordingStartTime)
      );
      setRecordMidiState({
        isRecording: true,
        recordingStartTime,
      });
    }
  };

  const stopRecord = (): void => {
    setIsRecording(false);
    const { recordedTimesteps } = recordMidiStateRef.current as RecordMidiState;
    const timestepSlices = Array.from(recordedTimesteps.values()).sort(
      (a, b) => a.timestep - b.timestep
    );

    // TODO format in a utility method rather than writing snake case here
    const loop = {
      timestep_slices: timestepSlices,
      start_timestep: 0,
      length: length,
    };
    submitRecording(loop);
    setRecordMidiState({ recordedTimesteps: new Map(), isRecording: false });
  };

  // init midi access on first render
  useEffect(() => {
    let midiInputs: any[] = [];
    WebMidi.enable((error) => {
      if (error) {
        console.warn("WebMidi could not be enabled.");
        return;
      } else {
        midiInputs = WebMidi.inputs;
        midiInputs.forEach((input) => {
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
    return () => {
      midiInputs.forEach((input) => {
        input.removeListener("noteon", "all");
        input.removeListener("noteoff", "all");
      });
    };
  }, []);

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOn = (midiEvent: any) => {
    const { activeNotes } = recordMidiStateRef.current as RecordMidiState;
    const currTimestep = getCurrentTimestep(
      recordMidiStateRef.current as RecordMidiState
    );
    const noteOnEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    console.log("note On event: ", noteOnEvent);
    const activeNotesCopy = _.cloneDeep(activeNotes);
    activeNotesCopy.set(noteOnEvent.value, noteOnEvent);
    setRecordMidiState({ activeNotes: activeNotesCopy });
  };

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOff = (midiEvent: any) => {
    const {
      activeNotes,
      recordedTimesteps = new Map(),
      isRecording,
    } = recordMidiStateRef.current as RecordMidiState;
    let stateUpdate = {};
    const currTimestep = getCurrentTimestep(
      recordMidiStateRef.current as RecordMidiState
    );
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
      setRecordMidiState({ ...stateUpdate, activeNotes: activeNotesCopy });
    }
  };

  const activeMidiList = !!recordMidiState.activeNotes
    ? Array.from(recordMidiState.activeNotes.keys())
    : [];

  useEffect(() => {
    if (!!consumedGameContext.roundRecordingStartTime) {
      scheduleRecordingDeadlines(
        consumedGameContext.roundRecordingStartTime,
        playSample,
        startRecord,
        stopRecord
      );
    }
  }, [consumedGameContext.roundRecordingStartTime]);

  return (
    <div>
      <Keyboard
        activeMidiList={activeMidiList}
        playNote={(midiNumber: number) => {
          if (!!recordMidiState.synth) {
            // play sound
            const noteName = midiNoteNumberToNoteName(midiNumber);
            recordMidiState.synth.triggerAttackRelease(noteName, "8n");
          }
        }}
        stopNote={(midiNumber: number) => {
          console.log("key up: ", midiNumber);
        }}
      />
    </div>
  );
};
export { RecordMidi };

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
  gameContext: {
    gameRules: { timestepSize, quantizationThreshold },
  },
  recordingStartTime,
}: RecordMidiState): number {
  const nowMicros = msToMicros(Date.now());
  return calculateTimestep(
    nowMicros,
    msToMicros(recordingStartTime),
    timestepSize,
    quantizationThreshold
  );
}

function calculateTimestep(
  timeUtc: number,
  recordingStartTime: number,
  timestepSize: number,
  quantizationThreshold: number
): number {
  const elapsedTime = Math.abs(timeUtc - recordingStartTime);
  const elapsedTimesteps = Math.floor(elapsedTime / timestepSize);
  const remainderTime = elapsedTime % timestepSize;
  const quantizeTimestep =
    remainderTime >= quantizationThreshold * 1000 ? 1 : 0;
  return elapsedTimesteps + quantizeTimestep;
}
