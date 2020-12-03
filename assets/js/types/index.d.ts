export interface Note {
  instrument: string,
  key: number;
  duration: number;
}

export interface TimestepSlice {
  timestep: number;
  notes: Note[];
}

export interface Loop {
  start_timestep: number;
  length: number;
  timestep_slices: TimestepSlice[];
}

export interface Musician {
  musician_id: string;
  loop: Loop;
}

export interface MIDINoteEvent {
  value: number;
  velocity: number;
  receivedTimestep: number;
}
