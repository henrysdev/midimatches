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

export interface GameContextType {
  gameSizeNumPlayers: number;
  musicians: Musician[];
  numVotesCast: number;
  quantizationThreshold: number;
  readyUps: any; //Map<string, boolean>;
  recordings: any; // Map<string, Loop>;
  roomId: string;
  roundRecordingStartTime: number;
  round: number;
  roundsToWin: number;
  scores: any; //Map<string, number>;
  timestepSize: number;
  winner: string;
  soloTimeLimit: number;
}
