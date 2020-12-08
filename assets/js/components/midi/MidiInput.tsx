import React, { useEffect, useRef, useState } from 'react';
import { NOTE_ON, NOTE_OFF } from '../../constants/index';
import { Loop, TimestepSlice, MIDINoteEvent } from '../../types/index';
import { ControlledPiano, MidiNumbers } from 'react-piano';
import WebMidi from 'webmidi';
import * as Tone from 'tone';
import _ from 'lodash';

interface MidiInputProps {
}

const MidiInput: React.FC<MidiInputProps> = () => {
  // keyboard state
  const [activeMidiNotes, _setActiveMidiNotes] = useState(new Map());
  const activeMidiNotesRef = useRef(activeMidiNotes);
  const setActiveMidiNotes = (data) => {
    activeMidiNotesRef.current = data;
    _setActiveMidiNotes(data);
  }
  const [synth, setSynth] = useState({});

  useEffect(() => {
    console.log('RELOADING')
    const niceSynth = new Tone.Synth({
      oscillator: {
        type: "amtriangle",
        harmonicity: 0.5,
        modulationType: "sine"
      },
      envelope: {
        attackCurve: "exponential",
        attack: 0.05,
        decay: 0.2,
        sustain: 0.2,
        release: 1.5,
      },
      portamento: 0.05
    }).toDestination();
    const limiter = new Tone.Limiter(-10).toDestination();
    niceSynth.connect(limiter);
    Tone.context.lookAhead = 0.02;
    setSynth(niceSynth);
  }, []);

  // recording state
  const [recordedTimesteps, setRecordedTimesteps] = useState(new Map());

  const startRecord = (): void => {
    setRecordedTimesteps(new Map());
  }
  
  const stopRecord = (): Loop => {
    const timestepSlices = Array.from(recordedTimesteps.values()).sort((a, b) => a.timestep - b.timestep);
    const loop: Loop = {
      timestep_slices: timestepSlices,
      start_timestep: timestepSlices[0],
      length: timestepSlices.length, // TODO calculate correctly (up to next multiple of 4)
    }
    return loop;
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

  const handleNoteOn = (midiEvent) => {
    const note: MIDINoteEvent = {
      value: midiEvent.note.number,
      velocity: midiEvent.rawVelocity,
      receivedTimestep: Tone.now(),
    };
    const mapCopy = _.cloneDeep(activeMidiNotesRef.current);
    mapCopy.set(midiEvent.note.number, {});
    setActiveMidiNotes(mapCopy);
  }

  const handleNoteOff = (midiEvent) => {
    const note: MIDINoteEvent = {
      value: midiEvent.note.number,
      velocity: midiEvent.rawVelocity,
      receivedTimestep: Tone.now(),
    };
    const mapCopy = _.cloneDeep(activeMidiNotesRef.current);
    mapCopy.delete(midiEvent.note.number);
    setActiveMidiNotes(mapCopy);
  }

  const activeMidiList = !!activeMidiNotesRef.current ? Array.from(activeMidiNotesRef.current.keys()) : [];

  return (
    <div>
      <ControlledPiano
      noteRange={{first: MidiNumbers.fromNote('c3'), last: MidiNumbers.fromNote('f5') }}
      activeNotes={activeMidiList}
      playNote={(midiNumber: number) => {
        const noteName = midiNoteNumberToNoteName(midiNumber);
        synth.triggerAttackRelease(noteName, "8n");
      }}
      stopNote={(midiNumber: number) => {
        console.log("key up: ", midiNumber);
      }}
      onPlayNoteInput={()=>{}}
      onStopNoteInput={()=>{}}
      width={1000}
    />
    </div>
  );
};
export { MidiInput };

const midiNoteNumberToNoteName = (midiNoteId: number): string => {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}

