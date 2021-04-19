import { useEffect, useState, useRef } from "react";
import _ from "lodash";

import {
  MIDINoteEvent,
  TimestepSlice,
  Note,
  GameRules,
  Milliseconds,
  Microseconds,
} from "../types";
import { useToneAudioContext, useBackingTrackContext } from ".";
import {
  scheduleRecordingDeadlines,
  getRecordingStartTimestamp,
} from "../helpers";
import {
  DEFAULT_MANUAL_NOTE_VELOCITY,
  MIN_NOTE_NUMBER,
  MAX_NOTE_NUMBER,
  DEFAULT_QUANTIZATION_SIZE,
} from "../constants";
import {
  msToMicros,
  midiVelocityToToneVelocity,
  currUtcTimestamp,
} from "../utils";
import { MidiNumbers } from "../components/reactpiano";

interface NoteRecorderProps {
  submitRecording: Function;
  sampleStartPlayCallback: Function;
  setIsRecording: Function;
  roundRecordingStartTime: number;
  gameRules: GameRules;
  shouldRecord: boolean;
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
  stopAllActiveNotes: () => void;
}

export function useNoteRecorder({
  submitRecording,
  sampleStartPlayCallback,
  setIsRecording,
  roundRecordingStartTime,
  gameRules,
  shouldRecord,
}: NoteRecorderProps): NoteRecorder {
  const {
    samplePlayer,
    currInputLagComp,
    startRecorder,
    stopRecorder,
    shouldQuantize,
  } = useToneAudioContext();

  const backingTrackContext = useBackingTrackContext();

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
      isRecording: false,
    });
  }, []);

  const startRecord = (recordingStartTime: Milliseconds): void => {
    // startRecorder();
    setIsRecording(true);
    if (!!roundRecordingStartTime) {
      // const recordingStartTime = getRecordingStartTimestamp(
      //   roundRecordingStartTime
      // );
      setInternalState({
        isRecording: true,
        recordingStartTime,
      });
    }
  };

  const stopRecord = (): void => {
    // stopRecorder("test");
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
                getCurrentTimestep(
                  internalStateRef.current as InternalState,
                  currInputLagComp,
                  { shouldQuantize: false, noteStart: false }
                ),
                {
                  note: { number: noteNumber },
                  receivedTimestep: currUtcTimestamp() - currInputLagComp,
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
      internalStateRef.current as InternalState,
      currInputLagComp,
      { shouldQuantize, noteStart: true }
    );
    const noteOnEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
    if (
      noteOnEvent.value >= MIN_NOTE_NUMBER &&
      noteOnEvent.value <= MAX_NOTE_NUMBER
    ) {
    }
    const activeNotesCopy = _.cloneDeep(activeNotes);
    activeNotesCopy.set(noteOnEvent.value, noteOnEvent);
    setInternalState({ activeNotes: activeNotesCopy });
  };

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOff = (midiEvent: any) => {
    const {
      activeNotes,
      recordedTimesteps = new Map(),
      isRecording,
    } = internalStateRef.current as InternalState;
    const currTimestep = getCurrentTimestep(
      internalStateRef.current as InternalState,
      currInputLagComp,
      { shouldQuantize, noteStart: false }
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
    if (!!roundRecordingStartTime && shouldRecord) {
      scheduleRecordingDeadlines(
        currUtcTimestamp(),
        sampleStartPlayCallback,
        startRecord,
        stopRecord,
        samplePlayer,
        backingTrackContext
      );
    }
  }, [roundRecordingStartTime]);

  const playRecordedNote = (
    noteNumber: number
  ): { noteNumber: number; noteVelocity: number } => {
    if (internalState.activeNotes.has(noteNumber)) {
      // midi event
      const origNote = internalState.activeNotes.get(noteNumber);
      const origVelocity = !!origNote ? origNote.velocity : 0;
      const noteVelocity = midiVelocityToToneVelocity(origVelocity);
      return { noteNumber, noteVelocity };
    } else {
      // keyboard/mouse event
      handleNoteOn({
        note: { number: noteNumber },
        rawVelocity: DEFAULT_MANUAL_NOTE_VELOCITY,
        receivedTimestep: currUtcTimestamp(),
      });
      return {
        noteNumber,
        noteVelocity: midiVelocityToToneVelocity(DEFAULT_MANUAL_NOTE_VELOCITY),
      };
    }
  };

  const stopRecordedNote = (noteNumber: number): { noteNumber: number } => {
    const { activeNotes } = internalStateRef.current as InternalState;
    if (activeNotes.has(noteNumber)) {
      handleNoteOff({
        note: { number: noteNumber },
        receivedTimestep: currUtcTimestamp(),
      });
    }
    return { noteNumber };
  };

  const stopAllActiveNotes = () => {
    const { activeNotes } = internalStateRef.current as InternalState;
    if (!!activeNotes) {
      const currActiveNotes = Array.from(activeNotes.keys());
      currActiveNotes.forEach((midiNum) => {
        stopRecordedNote(midiNum as any);
      });
    }
  };

  return {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
    stopAllActiveNotes,
  };
}

function getCurrentTimestep(
  {
    gameRules: { timestepSize, quantizationThreshold },
    recordingStartTime,
  }: InternalState,
  currInputLagComp: Milliseconds,
  { shouldQuantize, noteStart }: { shouldQuantize: boolean; noteStart: boolean }
): number {
  const nowMicros = msToMicros(currUtcTimestamp() - currInputLagComp);
  return calculateTimestep(
    nowMicros,
    msToMicros(recordingStartTime),
    timestepSize,
    shouldQuantize,
    quantizationThreshold,
    noteStart
  );
}

function calculateTimestep(
  timeUtc: number,
  recordingStartTime: number,
  timestepSize: number,
  shouldQuantize: boolean,
  quantizationThreshold: number,
  noteStart: boolean
): number {
  const elapsedTime = Math.abs(timeUtc - recordingStartTime);
  if (!!shouldQuantize) {
    const quantizationSize = DEFAULT_QUANTIZATION_SIZE;
    const sizeAdjustmentFactor = quantizationSize / timestepSize;
    const adjustedTimestepSize = quantizationSize;
    const elapsedTimesteps = Math.floor(elapsedTime / adjustedTimestepSize);
    const remainderTime = elapsedTime % adjustedTimestepSize;
    const quantizeTimestep =
      remainderTime >= quantizationThreshold * 1000 ? 1 : 0;
    const noteEndTimestep = noteStart ? 0 : 1;
    return (
      (elapsedTimesteps + quantizeTimestep + noteEndTimestep) *
      sizeAdjustmentFactor
    );
  } else {
    const elapsedTimesteps = Math.floor(elapsedTime / timestepSize);
    const remainderTime = elapsedTime % timestepSize;
    const quantizeTimestep =
      remainderTime >= quantizationThreshold * 1000 ? 1 : 0;
    return elapsedTimesteps + quantizeTimestep;
  }
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
