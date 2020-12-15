export interface Note {
  instrument: string;
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
  musicianId: string;
  loop: Loop;
}

export interface MIDINoteEvent {
  value: number;
  velocity: number;
  receivedTimestep: number;
}

export interface GameContextType {
  gameSizeNumPlayers: number;
  musicians: Musician[];
  numVotesCast: number;
  quantizationThreshold: number;
  readyUps: any;
  recordings: any;
  roomId: string;
  roomStartTime: number;
  round: number;
  roundsToWin: number;
  scores: any;
  timestepUs: number;
  winner: null;
}
