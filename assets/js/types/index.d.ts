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

export type NewChatMessagePayload = {
  chatMessages: ChatMessage[];
};

export interface ServerlistUpdatePayload {
  rooms: any[];
  numPlayersOnline: number;
}

export interface AdminAlertPayload {
  adminMessage: AdminMessage;
}

export type StartGamePayload = GameUpdatePayload;

export interface RoomState {
  gameRules: GameRules;
  roomPlayers: Player[];
  numCurrPlayers: number;
  roomId: string;
  roomName: string;
  inGame: boolean;
  startGameDeadline: number;
}

export interface GameState {
  gameRules: GameRules;
  roomId?: string;
  sampleBeats: BackingTrack[];
  gameView: string;
  players?: Player[];
  numVotesCast?: number;
  readyUps?: any;
  recordings?: RecordingTuple[];
  roundRecordingStartTime?: Milliseconds;
  gameWinners?: WinResult;
  contestants?: string[];
  roundNum: number;
  scores: ScoreTuple[];
  roundWinners?: WinResult;
  viewDeadline: Milliseconds;
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

export interface ChatMessage {
  senderId: string;
  isAudienceMember: boolean;
  senderAlias: string;
  messageText: string;
  timestamp: number;
}

export interface BackingTrack {
  name: string;
  fileUrl: string;
  bpm: number;
  musicalKey: string;
  author: string;
}

export interface AdminMessage {
  messageText: string;
  alertLifetime: number;
}

type RecordingTuple = [string, any];
type ScoreTuple = [string, number];

///////////////////////////////////////////////////////////////////////////////
// Outgoing Request Bodies                                                   //
///////////////////////////////////////////////////////////////////////////////
export interface CreateRoomPayload {
  room_name: string;
  max_players: number;
  num_rounds: number;
}

export interface UpdateUserPayload {
  user_alias: string;
}

export interface CreateAccountPayload {
  username: string;
  password: string;
  email: string;
}

export interface AccountLoginPayload {
  username: string;
  password: string;
}

export interface UpdatePasswordPayload {
  old_password?: string;
  password: string;
}

export interface RecoverAccountPayload {
  username: string;
  email: string;
}

export interface DeleteAccountPayload {
  password: string;
}

///////////////////////////////////////////////////////////////////////////////
// Contexts                                                                  //
///////////////////////////////////////////////////////////////////////////////
export interface ToneAudioContextType {
  Tone: any;
  originalMidiInputs: Input[];
  midiInputs: Input[];
  refreshMidiInputs: Function;
  setMidiInputs: Function;
  disabledMidiInputIds: string[];
  setDisabledMidiInputIds: Function;
  synth: any;
  samplePlayer: any;
  loadSample: Function;
  stopSample: Function;
  resetTone: Function;
  isSamplePlayerLoaded: boolean;
  setCurrVolume: Function;
  currVolume: number;
  soundIsOn: boolean;
  currInputLagComp: Milliseconds;
  setCurrInputLagComp: Function;
  recorder: any;
  startRecorder: Function;
  stopRecorder: Function;
  shouldQuantize: boolean;
  setShouldQuantize: Function;
}

export interface BackingTrackContextType {
  backingTrack: BackingTrack;
  sampleLength: Seconds;
  warmUpTime: Seconds;
  recordingTime: Seconds;
}

export interface PlayerContextType {
  player: Player;
  isAudienceMember: boolean;
}

export interface CurrentUserContextType {
  user: User;
}

export interface SocketContextType {
  socket: Socket;
}

type GameContextType = GameState;

export interface ChatContextType {
  chatHistory: ChatMessage[];
  submitChatMessageEvent: (messageText: string) => void;
}

export interface GameViewContextType {
  gameView: string;
}

export interface PlayersContextType {
  players?: Player[];
}

export interface ViewDeadlineContextType {
  viewDeadline: Milliseconds;
}

export interface RoundRecordingStartTimeContextType {
  roundRecordingStartTime: number;
}

export interface ClockOffsetContextType {
  clockOffset: Milliseconds;
}

export interface GameRulesContextType {
  gameRules: GameRules;
}

export interface ScoresContextType {
  scores: ScoreTuple[];
}

export interface BrowserCompatibilityContextType {
  supportedBrowser: boolean;
  showCompatibilityWarning: boolean;
  setShowCompatibilityWarning: Function;
  isMobileDevice: boolean;
}

export interface KeyboardInputContextType {
  disableKeyboardInput: boolean;
  setDisableKeyboardInput: Function;
  showKeyboardLabels: boolean;
  setShowKeyboardLabels: Function;
}

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
  registered: boolean;
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
