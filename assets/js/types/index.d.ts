import * as Tone from "tone";
import { Input } from "webmidi";
import { Socket } from "phoenix";

///////////////////////////////////////////////////////////////////////////////
// Audio                                                                     //
///////////////////////////////////////////////////////////////////////////////
export interface Note {
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

///////////////////////////////////////////////////////////////////////////////
// Server Data                                                               //
///////////////////////////////////////////////////////////////////////////////
export interface ResetRoomPayload {
  roomState: RoomState;
}

export interface LobbyUpdatePayload {
  roomState: RoomState;
}

export interface GameUpdatePayload {
  gameState: GameContextType;
}

export type PlayerJoinPayload = {
  roomState: RoomState;
  gameState: GameState;
};

export interface ServerlistUpdatePayload {
  rooms: any[];
}

export type StartGamePayload = GameUpdatePayload;

export interface RoomState {
  gameRules: GameRules;
  numCurrPlayers: number;
  roomId: string;
  roomName: string;
  inGame: boolean;
  startGameDeadline: number;
}

export interface GameState {
  gameRules: GameRules;
  roomId?: string;
  sampleBeats: string[];
  gameView: string;
  players?: Player[];
  numVotesCast?: number;
  readyUps?: any;
  recordings?: RecordingTuple[];
  roundRecordingStartTime?: number;
  gameWinners?: WinResult;
  contestants?: string[];
  roundNum: number;
  scores: ScoreTuple[];
  roundWinners?: WinResult;
  viewDeadline: number;
}

export interface ViewTimeouts {
  gameStart?: Milliseconds;
  roundStart: Milliseconds;
  recording?: Milliseconds;
  playbackVoting?: Milliseconds;
  roundEnd: Milliseconds;
  gameEnd?: Milliseconds;
}

export interface GameRules {
  minPlayers: number;
  maxPlayers: number;
  timestepSize: Microseconds;
  soloTimeLimit: number;
  quantizationThreshold: number;
  viewTimeouts: ViewTimeouts;
  roundsToWin: number;
}

export interface WinResult {
  winners: string[];
  numPoints: number;
}

type RecordingTuple = [string, any];
type ScoreTuple = [string, number];

///////////////////////////////////////////////////////////////////////////////
// Contexts                                                                  //
///////////////////////////////////////////////////////////////////////////////
export interface ToneAudioContextType {
  Tone: any;
  originalMidiInputs: Input[];
  midiInputs: Input[];
  setMidiInputs: Function;
  disabledMidiInputIds: string[];
  setDisabledMidiInputIds: Function;
  synth: any;
}

export interface PlayerContextType {
  player: Player;
}

export interface CurrentUserContextType {
  user: User;
}

export interface SocketContextType {
  socket: Socket;
}

type GameContextType = GameState;

///////////////////////////////////////////////////////////////////////////////
// Player Data                                                               //
///////////////////////////////////////////////////////////////////////////////
export interface Player {
  playerId: string;
  playerAlias: string;
}

export interface User {
  userAlias: string;
  userId: string;
}

interface PlayerScore {
  playerScore: number;
  playerRank: number;
}

export type PlayerData = Player & PlayerScore;

///////////////////////////////////////////////////////////////////////////////
// Units                                                                     //
///////////////////////////////////////////////////////////////////////////////
type Color = string;
type Seconds = number;
type Milliseconds = number;
type Microseconds = number;
