import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "webmidi";

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
import {
  msToMicros,
  microsToMs,
  midiVelocityToToneVelocity,
} from "../../utils";

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
  const { Tone, midiInputs } = useToneAudioContext();

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
    const niceSynth = new Tone.PolySynth(DEFAULT_SYNTH_CONFIG).toDestination();

    setRecordMidiState({
      activeNotes: new Map(),
      recordedTimesteps: new Map(),
      synth: niceSynth,
    });

    return () => {
      const {
        activeNotes,
        synth,
      } = recordMidiStateRef.current as RecordMidiState;

      // releases any active notes on component dismount to prevent orphaned sustains
      // TODO record the notes that are still being played when this happens
      Array.from(activeNotes.keys()).forEach((midiNumber) => {
        const noteName = midiNoteNumberToNoteName(midiNumber);
        synth.triggerRelease(noteName);
      });
    };
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
    const {
      recordedTimesteps,
      activeNotes,
      synth,
    } = recordMidiStateRef.current as RecordMidiState;
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
  }, []);

  // NOTE closured function - must use ref to manipulate state
  const handleNoteOn = (midiEvent: any) => {
    const { activeNotes } = recordMidiStateRef.current as RecordMidiState;
    const currTimestep = getCurrentTimestep(
      recordMidiStateRef.current as RecordMidiState
    );
    const noteOnEvent = webMidiEventToMidiNoteEvent(midiEvent, currTimestep);
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
          if (
            !!recordMidiState.synth &&
            recordMidiState.activeNotes.has(midiNumber)
          ) {
            const noteVelocity = midiVelocityToToneVelocity(
              recordMidiState.activeNotes.get(midiNumber).velocity
            );
            const noteName = midiNoteNumberToNoteName(midiNumber);
            recordMidiState.synth.triggerAttack(noteName, "+0", noteVelocity);
          }
        }}
        stopNote={(midiNumber: number) => {
          if (!!recordMidiState.synth) {
            const noteName = midiNoteNumberToNoteName(midiNumber);
            recordMidiState.synth.triggerRelease(noteName);
          }
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
