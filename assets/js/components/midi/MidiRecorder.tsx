import React, { useEffect } from 'react';
import { useState } from "react";
import { SimpleButton } from '../common/index';
import { MIDINoteEvent, Loop, Note } from '../../types/index';
import { Keyboard } from '../keyboard/index';
import { NOTE_ON, NOTE_OFF } from '../../constants/index';

interface MidiRecorderProps {
  roomStartTime: number,
  timestepSize: number,
  quantizationThreshold: number,
}

const MidiRecorder: React.FC<MidiRecorderProps> = ({
  roomStartTime,
  timestepSize,
  quantizationThreshold,
}) => {
  const [activeMidiNotes, setActiveMidiNotes] = useState(new Map());
  const [recordedTimesteps, setRecordedTimesteps] = useState(new Map());

  // init midi access on first render
  useEffect(() => {
    if (!!navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(onMidiSuccess, onMidiPermissionDenied);
    } else {
      console.log('WebMIDI is not supported in this browser.');
    }
  }, []);

  const onMidiPermissionDenied = (): void => {
    console.log('Could not access your MIDI devices.');
  }
  
  const onMidiSuccess = (midiAccess: WebMidi.MIDIAccess): void => {
    const inputs: WebMidi.MIDIInput[] = Array.from(midiAccess.inputs.values());
    inputs.forEach((midiInput) => {
      console.log(midiInput)
      midiInput.onmidimessage = handleMidiMessage;
      midiInput.onstatechange = handleMidiStateChange;
    })
  }
  
  const handleMidiStateChange = (midiState: WebMidi.MIDIConnectionEvent): void => {
    console.log('midi state change: ', midiState);
  }
  
  const handleMidiMessage = (midiMessage: WebMidi.MIDIMessageEvent): void => {
    const {data: [statusBytes, noteValueBytes, noteVelocityBytes]} = midiMessage;
  
    // split the status byte hex representation to obtain 4 bits values
    const statusByte = statusBytes.toString(16).split('');
    if(!statusByte[1]) statusByte.unshift('0');
    const eventType = parseInt(statusByte[0], 16);
    const _channel = parseInt(statusByte[1], 16);
    const now = Date.now()
    const receivedTimestep = calculateTimestep(
      now,
      roomStartTime,
      timestepSize,
      quantizationThreshold
    );
  
    const note: MIDINoteEvent = {
      value: noteValueBytes,
      velocity: noteVelocityBytes,
      receivedTimestep: receivedTimestep,
    };
  
    switch(eventType) {
      case NOTE_ON:
        noteOn(note);
        break;
      case NOTE_OFF:
        noteOff(note);
        break;
      default:
        console.log('unrecognized event type encountered: ', eventType);
    }
  }

  const startRecord = (): void => {
    setActiveMidiNotes(new Map());
    setRecordedTimesteps(new Map());
  }
  
  const stopRecord = (): Loop => {
    const timestepSlices = Array.from(recordedTimesteps.values()).sort((a, b) => a.timestep - b.timestep);
    const loop: Loop = {
      timestep_slices: timestepSlices,
      start_timestep: timestepSlices[0],
      length: timestepSlices.length, // TODO calculate correctly (up to next multiple of 4)
    }
    console.log("LOOP PRODUCED: ", loop);
    return loop;
  }

  // handle midi key down event
  const noteOn = (noteOnEvent: MIDINoteEvent): void => {
    const midiMapCopy = activeMidiNotes; //_.cloneDeep(activeMidiNotes);
    midiMapCopy.set(noteOnEvent.value, noteOnEvent);
    setActiveMidiNotes(midiMapCopy);
  }

  // handle midi key up event
  const noteOff = (noteOffEvent: MIDINoteEvent): void => {
    if (activeMidiNotes.has(noteOffEvent.value)) {
      const noteOnEvent = activeMidiNotes.get(noteOffEvent.value);
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
      console.log("active midi notes: ", activeMidiNotes)
      
      activeMidiNotes.delete(key_);
      setActiveMidiNotes(activeMidiNotes);
      setRecordedTimesteps(recordedTimesteps.set(startTimestep, updatedTimestepSlice));
    }
  }

  return (
    <div>
      <Keyboard activeMidiNotes={Array.from(activeMidiNotes.keys())} />
      <SimpleButton label="start recording" callback={() => startRecord()} disabled={false} />
      <SimpleButton label="stop recording" callback={() => stopRecord()} disabled={false} />
    </div>
  );
};
export { MidiRecorder };

const calculateTimestep = (
  timeUtc: number,
  roomStartTime: number,
  timestepSize: number,
  quantizationThreshold: number,
): number => {
  const elapsedTime = Math.abs(timeUtc - roomStartTime)
  const elapsedTimesteps = Math.floor(elapsedTime/timestepSize);
  const remainderTime = elapsedTime % timestepSize;
  const quantizeTimestep = remainderTime >= quantizationThreshold * 1000 ? 1 : 0
  return elapsedTimesteps + quantizeTimestep;
}
