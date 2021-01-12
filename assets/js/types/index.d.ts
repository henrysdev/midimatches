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
  startTimestep: number;
  length: number;
  timestepSlices: TimestepSlice[];
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

export interface GameRules {
  gameSizeNumPlayers: number;
  timestepSize: number;
  soloTimeLimit: number;
  quantizationThreshold: number;
}

export interface GameContextType {
  // static fields
  gameRules: GameRules;
  roomId: string;

  // dynamic fields
  musicians: string[];
  numVotesCast: number;
  readyUps: any;
  recordings: any;
  roundRecordingStartTime: number;
  winner: any;
  contestants: string[];
  judges: string[];
}
