import * as Tone from "tone";
import { Input } from "webmidi";

export interface Note {
  instrument: string;
  key: number;
  duration: number;
  velocity: number;
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

export interface Player {
  musicianId: string;
  playerAlias: string;
}

export interface MIDINoteEvent {
  value: number;
  velocity: number;
  receivedTimestep: number;
}

export interface LocalNoteEvent {
  time: number;
  note: any;
  velocity: number;
  duration?: number;
}

export type SamplePlayer = Tone.Player;

export interface ViewUpdatePayload {
  gameState: GameContextType;
}

export interface PlayerJoinPayload {
  player: Player;
}

interface PlayerScore {
  playerScore: number;
  playerRank: number;
}
export type PlayerData = Player & PlayerScore;

export interface ViewTimeouts {
  roundStart: Milliseconds;
  recording?: Milliseconds;
  playbackVoting?: Milliseconds;
  roundEnd: Milliseconds;
}

export interface GameRules {
  gameSizeNumPlayers: number;
  timestepSize: number;
  soloTimeLimit: number;
  quantizationThreshold: number;
  viewTimeouts: ViewTimeouts;
}

/* Context Types */
export interface GameContextType {
  // static fields
  gameRules: GameRules;
  roomId?: string;

  // dynamic fields
  gameView: string;
  players?: Player[];
  numVotesCast?: number;
  readyUps?: any;
  recordings?: Object;
  roundRecordingStartTime?: number;
  winner?: any;
  contestants?: string[];
  roundNum: number;
  scores: any;
}

export interface ToneAudioContextType {
  Tone: any;
  midiInputs: Input[];
}

export interface PlayerContextType {
  player: Player;
}

/* Time Units */
type Seconds = number;
type Milliseconds = number;
type Microseconds = number;
