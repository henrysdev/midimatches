import { Loop, TimestepSlice } from './types'
import { roomStartTime } from './socket'

const NOTE_ON = 0x9;
const NOTE_OFF = 0x8;

export interface MIDINoteEvent {
  value: number;
  velocity: number;
  receivedTimestep: number;
}

/**
 * MidiRecorder is responsible for providing an API and maintaining state
 * for recording MIDI samples.
 */
export class MidiRecorder{
  startTimestep: number;
  // mapping of currently pressed notes (note value -> midi note)
  activeMidiNotes: Map<number, MIDINoteEvent>;

  constructor() {
    this.activeMidiNotes = new Map();
    this.startTimestep = -1;
  }

  startRecord(): void {
    this.startTimestep = roomStartTime;
  }

  stopRecord(): Loop {
    const timestepSlices: TimestepSlice[] = [];
    // TODO use transform method from midi notes to timestep slices
    const loop: Loop = {
      timestep_slices: timestepSlices,
      start_timestep: this.startTimestep,
    };
    this.activeMidiNotes.clear();
    return loop;
  }

  noteOn(noteOnEvent: MIDINoteEvent): void {
    console.log('note ON: ', noteOnEvent);
    this.activeMidiNotes.set(noteOnEvent.value, noteOnEvent);
  }

  noteOff(noteOffEvent: MIDINoteEvent): void {
    console.log('note OFF: ', noteOffEvent);
    if (this.activeMidiNotes.has(noteOffEvent.value)) {
      const noteOnEvent = this.activeMidiNotes.get(noteOffEvent.value);
      const duration = Math.abs(noteOnEvent.receivedTimestep - noteOffEvent.receivedTimestep);
      // TODO calculate start, stop, and duration of note in timesteps
      // relative to room clock start UTC
      this.activeMidiNotes.delete(noteOnEvent.value);
    }
  }
}

const midiRecorder = new MidiRecorder();

// check if browser supports WebMIDI API
if (!!navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess()
    .then(onMidiSuccess, onMidiPermissionDenied);
} else {
  console.log('WebMIDI is not supported in this browser.');
}

function onMidiPermissionDenied(): void {
  console.log('Could not access your MIDI devices.');
}

function onMidiSuccess(midiAccess: WebMidi.MIDIAccess): void {
  const inputs: WebMidi.MIDIInput[] = Array.from(midiAccess.inputs.values());
  inputs.forEach((midiInput) => {
    console.log(midiInput)
    midiInput.onmidimessage = handleMidiMessage;
    midiInput.onstatechange = handleMidiStateChange;
  })
}

function handleMidiStateChange(midiState: WebMidi.MIDIConnectionEvent): void {
  console.log('midi state: ', midiState);
}

function handleMidiMessage(midiMessage: WebMidi.MIDIMessageEvent): void {
  const {data: [statusBytes, noteValueBytes, noteVelocityBytes]} = midiMessage;

  // split the status byte hex representation to obtain 4 bits values
  const statusByte = statusBytes.toString(16).split('');
  if(!statusByte[1]) statusByte.unshift('0');
  const eventType = parseInt(statusByte[0], 16);
  const _channel = parseInt(statusByte[1], 16);

  const note: MIDINoteEvent = {
    value: noteValueBytes,
    velocity: noteVelocityBytes,
    receivedTimestep: roomStartTime,
  };

  switch(eventType) {
    case NOTE_ON:
      midiRecorder.noteOn(note);
      break;
    case NOTE_OFF:
      midiRecorder.noteOff(note);
      break;
    default:
      console.log('unrecognized event type encountered: ', eventType);
  }
}
