import * as Tone from "tone";

// MIDI codes
export const NOTE_ON = 0x9;
export const NOTE_OFF = 0x8;

// Possible game state views
export enum GAME_VIEW {
  PREGAME_LOBBY,
  GAME_START,
  ROUND_START,
  RECORDING,
  PLAYBACK_VOTING,
  ROUND_END,
  GAME_END,
}

export enum PRACTICE_GAME_VIEW {
  SAMPLE_SELECTION,
  RECORDING,
  PLAYBACK,
}

export const S3_BUCKET_URL = "https://progressions-game.s3.amazonaws.com";

export const SERVERLIST_UPDATE_EVENT = "serverlist_update";

export const GAME_UPDATE_EVENT = "game_update";
export const START_GAME_EVENT = "start_game";
export const RESET_ROOM_EVENT = "reset_room";
export const LOBBY_UPDATE_EVENT = "lobby_update";
export const NEW_CHAT_MESSAGE_EVENT = "new_chat_message";

export const SUBMIT_REGISTERED_JOIN = "user_enter_room";
export const SUBMIT_JOIN = "player_join";
export const SUBMIT_LEAVE_ROOM = "player_leave_room";
export const SUBMIT_READY_UP_EVENT = "player_ready_up";
export const SUBMIT_RECORDING_EVENT = "player_recording";
export const SUBMIT_VOTE_EVENT = "player_vote";
export const SUBMIT_CHAT_MESSAGE = "player_chat_message";

export const MAX_CHAT_HISTORY_LENGTH = 200;
export const MAX_CHARS_PER_CHAT_MESSAGE = 80;

export const MIN_PLAYER_ALIAS_LENGTH = 3;
export const MAX_PLAYER_ALIAS_LENGTH = 10;

export const DEFAULT_SAMPLE_COLORS = [
  "rgba(255, 127, 0, 0.15)",
  "rgba(255, 213, 0, 0.15)",
  "rgba(255, 212, 0, 0.15)",
  "rgba(106, 255, 0, 0.15)",
  "rgba(0, 234, 255, 0.15)",
  "rgba(0, 149, 255, 0.15)",
  "rgba(0, 64, 255, 0.15)",
  "rgba(170, 0, 255, 0.15)",
  "rgba(255, 0, 170, 0.15)",
  "rgba(143, 35, 35, 0.15)",
  "rgba(143, 106, 35, 0.15)",
  "rgba(79, 143, 35, 0.15)",
  "rgba(35, 98, 143, 0.15)",
  "rgba(107, 35, 143, 0.15)",
];

export const DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH = 2;
export const DEFAULT_SAMPLE_LENGTH = 10.6667;
export const DEFAULT_NUM_WARMUP_LOOPS = 1;
export const DEFAULT_NUM_RECORDED_LOOPS = 1;
export const DEFAULT_RECORDING_LENGTH =
  DEFAULT_SAMPLE_LENGTH * DEFAULT_NUM_RECORDED_LOOPS;
export const DEFAULT_WARMUP_LENGTH =
  DEFAULT_SAMPLE_LENGTH * DEFAULT_NUM_WARMUP_LOOPS;

export const DEFAULT_SAMPLE_VOLUME = -4;

export const DEFAULT_SYNTH_CONFIG = {
  oscillator: {
    type: "amtriangle",
    harmonicity: 0.5,
    modulationType: "sine",
  },
  envelope: {
    attackCurve: "exponential",
    attack: 0.03,
    decay: 0.4,
    sustain: 0.2,
    release: 0.5,
  },
  volume: -2,
  portamento: 0.05,
} as Tone.SynthOptions;

export const DEFAULT_FM_SYNTH_CONFIG = {
  volume: -3,
  detune: 0,
  portamento: 0,
  harmonicity: 1,
  oscillator: {
    partialCount: 0,
    partials: [],
    phase: 0,
    type: "sine",
  },
  envelope: {
    attack: 0.001,
    attackCurve: "linear",
    decay: 0.3,
    decayCurve: "exponential",
    release: 0.5,
    releaseCurve: "exponential",
    sustain: 1,
  },
  modulation: {
    partialCount: 0,
    partials: [],
    phase: 7,
    type: "sawtooth",
  },
  modulationEnvelope: {
    attack: 0.03,
    attackCurve: "linear",
    decay: 0.01,
    decayCurve: "exponential",
    release: 0.5,
    releaseCurve: "exponential",
    sustain: 1,
  },
  modulationIndex: 12.22,
} as any;

export const DEFAULT_MANUAL_NOTE_VELOCITY = 65;

// room creation parameters
export const MIN_ROOM_SIZE = 3;
export const MAX_ROOM_SIZE = 6;
export const DEFAULT_ROOM_SIZE = 4;

export const MIN_NUM_ROUNDS = 1;
export const MAX_NUM_ROUNDS = 10;
export const DEFAULT_NUM_ROUNDS = 3;

export const MIN_ROOM_NAME_LENGTH = 3;
export const MAX_ROOM_NAME_LENGTH = 20;

export const MIN_SOUND_VOLUME = -25.0;
export const MAX_SOUND_VOLUME = 2.5;

export const SOUND_VOLUME_COOKIE = "midimatches_soundvolume";
