import { useEffect, useState, useRef } from "react";
import _ from "lodash";

import { MIDINoteEvent, TimestepSlice, Note, GameRules } from "../types";
import { useToneAudioContext } from ".";
import {
  scheduleRecordingDeadlines,
  getRecordingStartTimestamp,
} from "../helpers";
import { msToMicros, microsToMs, midiVelocityToToneVelocity } from "../utils";

interface NoteRecorderProps {
  submitRecording: Function;
  playSample: Function;
  setIsRecording: Function;
  roundRecordingStartTime: number;
  gameRules: GameRules;
  castToNoteEvent: (arg0: any, arg1: number) => MIDINoteEvent;
}

interface InternalState {
  activeNotes: Map<number, MIDINoteEvent>;
  recordedTimesteps: Map<number, TimestepSlice>;
  synth: any;
  isRecording: boolean;
  recordingStartTime: number;
  gameRules: GameRules;
}

interface NoteRecorder {
  activeMidiList: Array<number>;
  handleNoteOn: (midiEvent: any) => void;
  handleNoteOff: (midiEvent: any) => void;
  playRecordedNote: (
    noteNumber: number
  ) => { noteNumber: number; noteVelocity: number };
  stopRecordedNote: (noteNumber: number) => { noteNumber: number };
}

export function useNoteRecorder({
  submitRecording,
  playSample,
  setIsRecording,
  roundRecordingStartTime,
  gameRules,
  castToNoteEvent,
}: NoteRecorderProps): NoteRecorder {
  const { Tone } = useToneAudioContext();

  const [internalState, _setInternalState] = useState<InternalState>(
    {} as InternalState
  );
  const internalStateRef = useRef({});
  const setInternalState = (data: any) => {
    const updatedInputState = { ...internalStateRef.current, ...data };
    internalStateRef.current = updatedInputState;
    _setInternalState(updatedInputState);
  };

  // init on load
  useEffect(() => {
    setInternalState({
      activeNotes: new Map(),
      recordedTimesteps: new Map(),
      gameRules,
    });
  }, []);

  const startRecord = (): void => {
    setIsRecording(true);
    if (!!roundRecordingStartTime) {
      const recordingStartTime = getRecordingStartTimestamp(
        microsToMs(roundRecordingStartTime)
      );
      setInternalState({
        isRecording: true,
        recordingStartTime,
      });
    }
  };

  const stopRecord = (): void => {
    setIsRecording(false);
    const {
      recordedTimesteps,
      activeNotes,
    } = internalStateRef.current as InternalState;

    // finish recording any active notes
    const allRecordedTimesteps =
      activeNotes.size > 0
        ? Array.from(activeNotes.entries()).reduce(
            (acc, [noteNumber, _noteEvent]) => {
              const {
                stateUpdate: { recordedTimesteps: updatedAcc },
              } = recordNoteOff(
                activeNotes,
                acc,
                true,
                getCurrentTimestep(internalStateRef.current as InternalState),
                {
                  note: { number: noteNumber },
                  receivedTimestep: Date.now(),
                }
              );
              return updatedAcc;
            },
            recordedTimesteps
          )
        : recordedTimesteps;

    const timestepSlices = Array.from(allRecordedTimesteps.values()).sort(
      (a, b) => a.timestep - b.timestep
    );

    // TODO format in a utility method rather than writing snake case here
    const loop = {
      timestep_slices: timestepSlices,
      start_timestep: 0,
      length: length,
    };
    submitRecording(loop);
    setInternalState({ recordedTimesteps: new Map(), isRecording: false });
  };

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOn = (midiEvent: any) => {
    const { activeNotes } = internalStateRef.current as InternalState;
    const currTimestep = getCurrentTimestep(
      internalStateRef.current as InternalState
    );
    const noteOnEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    const activeNotesCopy = _.cloneDeep(activeNotes);
    activeNotesCopy.set(noteOnEvent.value, noteOnEvent);
    setInternalState({ activeNotes: activeNotesCopy });
  };

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOff = (midiEvent: any) => {
    // const {
    //   activeNotes,
    //   recordedTimesteps = new Map(),
    //   isRecording,
    // } = internalStateRef.current as InternalState;
    // let stateUpdate = {};
    // const currTimestep = getCurrentTimestep(
    //   internalStateRef.current as InternalState
    // );
    // const noteOffEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    // const activeNotesCopy = _.cloneDeep(activeNotes);
    // if (activeNotesCopy.has(noteOffEvent.value)) {
    //   const noteOnEvent = activeNotesCopy.get(noteOffEvent.value);
    //   const {
    //     value: key,
    //     receivedTimestep: startTimestep,
    //     velocity,
    //   } = noteOnEvent as MIDINoteEvent;

    //   // update recorded timestep slice with new note
    //   if (isRecording) {
    //     const newNote: Note = {
    //       instrument: "",
    //       key: key,
    //       duration: Math.max(
    //         1,
    //         Math.abs(startTimestep - noteOffEvent.receivedTimestep)
    //       ),
    //       velocity,
    //     };
    //     const updatedNotes = recordedTimesteps.has(startTimestep)
    //       ? [newNote].concat(recordedTimesteps.get(startTimestep).notes)
    //       : [newNote];
    //     const updatedTimestepSlice = {
    //       timestep: startTimestep,
    //       notes: updatedNotes,
    //     };
    //     stateUpdate = {
    //       recordedTimesteps: recordedTimesteps.set(
    //         startTimestep,
    //         updatedTimestepSlice
    //       ),
    //     };
    //   }

    //   activeNotesCopy.delete(noteOffEvent.value);
    //   setInternalState({ ...stateUpdate, activeNotes: activeNotesCopy });
    // }
    const {
      activeNotes,
      recordedTimesteps = new Map(),
      isRecording,
    } = internalStateRef.current as InternalState;
    const currTimestep = getCurrentTimestep(
      internalStateRef.current as InternalState
    );

    const { noteOffEvent, stateUpdate, activeNotesCopy } = recordNoteOff(
      activeNotes,
      recordedTimesteps,
      isRecording,
      currTimestep,
      midiEvent
    );

    activeNotesCopy.delete(noteOffEvent.value);
    setInternalState({ ...stateUpdate, activeNotes: activeNotesCopy });
  };

  const activeMidiList = !!internalState.activeNotes
    ? Array.from(internalState.activeNotes.keys())
    : [];

  useEffect(() => {
    if (!!roundRecordingStartTime) {
      scheduleRecordingDeadlines(
        roundRecordingStartTime,
        playSample,
        startRecord,
        stopRecord
      );
    }
  }, [roundRecordingStartTime]);

  const playRecordedNote = (
    noteNumber: number
  ): { noteNumber: number; noteVelocity: number } => {
    if (internalState.activeNotes.has(noteNumber)) {
      const origNote = internalState.activeNotes.get(noteNumber);
      const origVelocity = !!origNote ? origNote.velocity : 0;
      const noteVelocity = midiVelocityToToneVelocity(origVelocity);
      return { noteNumber, noteVelocity };
    } else {
      handleNoteOn({
        note: { number: noteNumber },
        rawVelocity: 80,
        receivedTimestep: Date.now(),
      });
      return { noteNumber, noteVelocity: 0.3 };
    }
  };

  const stopRecordedNote = (noteNumber: number): { noteNumber: number } => {
    if (internalState.activeNotes.has(noteNumber)) {
      handleNoteOff({
        note: { number: noteNumber },
        receivedTimestep: Date.now(),
      });
    }
    return { noteNumber };
  };

  return {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
  };
}

function getCurrentTimestep({
  gameRules: { timestepSize, quantizationThreshold },
  recordingStartTime,
}: InternalState): number {
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

const recordNoteOff = (
  activeNotes: any,
  recordedTimesteps: any,
  isRecording: any,
  currTimestep: number,
  midiEvent: any
): { noteOffEvent: MIDINoteEvent; stateUpdate: any; activeNotesCopy: any } => {
  let stateUpdate = {};
  const noteOffEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
  const activeNotesCopy = _.cloneDeep(activeNotes);
  if (activeNotesCopy.has(noteOffEvent.value)) {
    const noteOnEvent = activeNotesCopy.get(noteOffEvent.value);
    const {
      value: key,
      receivedTimestep: startTimestep,
      velocity,
    } = noteOnEvent as MIDINoteEvent;

    // update recorded timestep slice with new note
    if (isRecording) {
      const newNote: Note = {
        instrument: "",
        key: key,
        duration: Math.max(
          1,
          Math.abs(startTimestep - noteOffEvent.receivedTimestep)
        ),
        velocity,
      };
      const updatedNotes = recordedTimesteps.has(startTimestep)
        ? [newNote].concat(recordedTimesteps.get(startTimestep).notes)
        : [newNote];
      const updatedTimestepSlice = {
        timestep: startTimestep,
        notes: updatedNotes,
      };
      stateUpdate = {
        recordedTimesteps: recordedTimesteps.set(
          startTimestep,
          updatedTimestepSlice
        ),
      };
    }
  }
  return { noteOffEvent, stateUpdate, activeNotesCopy };
};
