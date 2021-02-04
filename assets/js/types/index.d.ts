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

export interface Playhead {
  startTime: number;
  endTime: number;
}

export type SamplePlayer = Tone.Player;

export interface LobbyUpdatePayload {
  numPlayersJoined: number;
  numPlayersToStart: number;
  gameInProgress: boolean;
}

export interface GameUpdatePayload {
  gameState: GameContextType;
}

export interface PlayerJoinPayload {
  player: Player;
}

export type StartGamePayload = GameUpdatePayload;

interface PlayerScore {
  playerScore: number;
  playerRank: number;
}
export type PlayerData = Player & PlayerScore;

export interface ViewTimeouts {
  gameStart?: Milliseconds;
  roundStart: Milliseconds;
  recording?: Milliseconds;
  playbackVoting?: Milliseconds;
  roundEnd: Milliseconds;
  gameEnd?: Milliseconds;
}

export interface GameRules {
  gameSizeNumPlayers: number;
  timestepSize: Microseconds;
  soloTimeLimit: number;
  quantizationThreshold: number;
  viewTimeouts: ViewTimeouts;
}

export interface WinResult {
  winners: Array<string>;
  numPoints: number;
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
  gameWinners?: WinResult;
  contestants?: string[];
  roundNum: number;
  scores: any;
  roundWinners?: WinResult;
}

export interface ToneAudioContextType {
  Tone: any;
  midiInputs: Input[];
}

export interface PlayerContextType {
  player: Player;
}

type Seconds = number;
type Milliseconds = number;
type Microseconds = number;

type Color = string;
