import React, { useContext, useEffect, useRef, useState } from 'react';

import { SimpleButton } from '../common/index'
import { Loop, MIDINoteEvent, Note } from '../../types/index';
import WebMidi from 'webmidi';
import * as Tone from 'tone';
import _ from 'lodash';
import { Keyboard } from '../room/index';
import { GameContext } from '../../contexts/index';

interface MidiInputProps {
  setRecordingCallback: Function;
}

const MidiInput: React.FC<MidiInputProps> = ({setRecordingCallback}) => {
  // game context event listener closure workaround
  const consumedGameContext = useContext(GameContext);
  const [gameContext, _setGameContext] = useState(consumedGameContext);
  const gameContextRef = useRef(gameContext);
  const setGameContext = (data: any) => {
    gameContextRef.current = data;
    _setGameContext(data);
  }
  useEffect(() => {
    setGameContext(consumedGameContext);
  }, [consumedGameContext]);

  // keyboard event listener closure workaround
  const [activeMidiNotes, _setActiveMidiNotes] = useState(new Map());
  const activeMidiNotesRef = useRef(activeMidiNotes);
  const setActiveMidiNotes = (data: any) => {
    activeMidiNotesRef.current = data;
    _setActiveMidiNotes(data);
  }

  // instrument
  const [synth, setSynth] = useState({});
  useEffect(() => {
    const niceSynth = new Tone.Synth({
      oscillator: {
        type: "amtriangle",
        harmonicity: 0.5,
        modulationType: "sine"
      },
      envelope: {
        attackCurve: "exponential",
        attack: 0.03,
        decay: 0.4,
        sustain: 0.2,
        release: 1.5,
      },
      portamento: 0.05
    }).toDestination();
    Tone.context.lookAhead = 0.02;
    setSynth(niceSynth); 
  }, []);

  // recording
  const [recordedTimesteps, _setRecordedTimesteps] = useState(new Map());
  const recordedTimestepsRef = useRef();
  const setRecordedTimesteps = (data: any) => {
    recordedTimestepsRef.current = data;
    _setRecordedTimesteps(data);
  }
  const [isRecording, setIsRecording] = useState(false);

  const stopRecord = (): void => {
    const timestepSlices = Array.from(recordedTimesteps.values()).sort((a, b) => a.timestep - b.timestep);
    const loop: Loop = {
      timestep_slices: timestepSlices,
      start_timestep: timestepSlices[0].timestep,
      length: timestepSlices.length, // TODO calculate correctly (up to next multiple of 4)
    }
    setRecordingCallback(loop);
    setRecordedTimesteps(new Map());
    setIsRecording(false);
  }

  // init midi access on first render
  useEffect(() => {
    WebMidi.enable((error: WebMidi.Error) => {
      if (error) {
        console.warn('WebMidi could not be enabled.');
        return;
      } else {
        onMidiSuccess(WebMidi.inputs);
      }
      console.log('WebMidi enabled.');
      if (WebMidi.inputs.length === 0) {
        console.log('No MIDI inputs.');
        return;
      }
    });
  }, []);

  const onMidiSuccess = (inputs: WebMidi.Input[]) => {
    inputs.forEach((input: WebMidi.Input) => {
      input.addListener('noteon', 'all', (event: WebMidi.MidiEvent) => {
        console.log(event)
        handleNoteOn(event);
      });
      input.addListener('noteoff', 'all', (event: WebMidi.MidiEvent) => {
        handleNoteOff(event);
      });
    })
  }

  const handleNoteOn = (midiEvent: any) => {
    const now = Date.now() * 1000;
    const gameCtx = gameContextRef.current;
    const noteOnEvent = webMidiEventToMidiNoteEvent(
      midiEvent,
      now,
      gameCtx
    );
    const mapCopy = _.cloneDeep(activeMidiNotesRef.current);
    mapCopy.set(noteOnEvent.value, noteOnEvent);
    setActiveMidiNotes(mapCopy);
  }

  const handleNoteOff = (midiEvent: any) => {
    const now = Date.now() * 1000;
    const gameCtx = gameContextRef.current;
    const noteOffEvent = webMidiEventToMidiNoteEvent(
      midiEvent,
      now,
      gameCtx
    );
    const mapCopy = _.cloneDeep(activeMidiNotesRef.current);
    if (mapCopy.has(noteOffEvent.value)) {
      const noteOnEvent = mapCopy.get(noteOffEvent.value);
      const {value: key_, receivedTimestep: startTimestep} = noteOnEvent;

      // update recorded timestep slice with new note
      const newNote: Note = {
        instrument: "abc",
        key: key_,
        duration: Math.max(1, Math.abs(startTimestep - noteOffEvent.receivedTimestep))
      }
      const updatedNotes = recordedTimesteps.has(startTimestep)
        ? [newNote].concat(recordedTimesteps.get(startTimestep).notes)
        : [newNote]
      const updatedTimestepSlice = {
        timestep: startTimestep,
        notes: updatedNotes
      }

      console.log("recorded timesteps: ", recordedTimesteps)
      console.log("active midi notes: ", mapCopy)
    
      mapCopy.delete(noteOffEvent.value);
      setActiveMidiNotes(mapCopy);    
      setRecordedTimesteps(recordedTimesteps.set(startTimestep, updatedTimestepSlice));
    }
  }
  

  const activeMidiList = !!activeMidiNotesRef.current ? Array.from(activeMidiNotesRef.current.keys()) : [];

  return (
    <div>
      <Keyboard
      activeMidiList={activeMidiList}
      playNote={(midiNumber: number) => {
        // play sound
        const noteName = midiNoteNumberToNoteName(midiNumber);
        synth.triggerAttackRelease(noteName, "8n");
      }}
      stopNote={(midiNumber: number) => {
        console.log("key up: ", midiNumber);
      }}
      />
      <SimpleButton
        label="Start Recording"
        callback={() => setIsRecording(true)}
        disabled={isRecording}
      />
      <SimpleButton
        label="Stop Recording"
        callback={() => stopRecord()}
        disabled={!isRecording}
      />
    </div>
  );
};
export { MidiInput };

function midiNoteNumberToNoteName(midiNoteId: number): string {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}

function webMidiEventToMidiNoteEvent(
  webMidiEvent,
  timestamp: number,
  {roomStartTime, timestepSize, quantizationThreshold},
): MIDINoteEvent {
  const receivedTimestep = calculateTimestep(
    timestamp,
    roomStartTime,
    timestepSize,
    quantizationThreshold
  );
  console.log('TIMESTAMP ', timestamp);
  console.log('ROOMSTARTTIME ', roomStartTime);
  console.log('TIMESTEPSIZE ', timestepSize);
  console.log('QUANTIZATIONTHRESH ', quantizationThreshold);
  console.log('**resulting timestep**', receivedTimestep);
  return {
    value: webMidiEvent.note.number,
    velocity: webMidiEvent.rawVelocity,
    receivedTimestep: receivedTimestep,
  } as MIDINoteEvent;
}

function calculateTimestep(
  timeUtc: number,
  roomStartTime: number,
  timestepSize: number,
  quantizationThreshold: number,
): number {
  const elapsedTime = Math.abs(timeUtc - roomStartTime)
  const elapsedTimesteps = Math.floor(elapsedTime/timestepSize);
  const remainderTime = elapsedTime % timestepSize;
  const quantizeTimestep = remainderTime >= quantizationThreshold * 1000 ? 1 : 0
  return elapsedTimesteps + quantizeTimestep;
}
