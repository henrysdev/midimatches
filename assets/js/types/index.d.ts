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
  playerName: string;
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

export interface GameContextType {
  // static fields
  gameRules: GameRules;
  roomId?: string;

  // dynamic fields
  gameView: string;
  musicians?: string[];
  numVotesCast?: number;
  readyUps?: any;
  recordings?: Object;
  roundRecordingStartTime?: number;
  winner?: any;
  contestants?: string[];
  judges?: string[];
}

export interface ToneAudioContextType {
  Tone: any;
  midiInputs: Input[];
}

type Seconds = number;
type Milliseconds = number;
type Microseconds = number;
