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

export const SERVERLIST_UPDATE_EVENT = "serverlist_update";

export const GAME_UPDATE_EVENT = "game_update";
export const START_GAME_EVENT = "start_game";
export const RESET_ROOM_EVENT = "reset_room";
export const LOBBY_UPDATE_EVENT = "lobby_update";
export const NEW_CHAT_MESSAGES_EVENT = "new_chat_messages";
export const ADMIN_ALERT_MESSAGE_EVENT = "admin_alert";
export const DUPLICATE_SESSION_EVENT = "duplicate_session";

export const SUBMIT_REGISTERED_JOIN = "user_enter_room";
export const SUBMIT_JOIN = "player_join";
export const SUBMIT_LEAVE_ROOM = "player_leave_room";
export const SUBMIT_READY_UP_EVENT = "player_ready_up";
export const SUBMIT_RECORDING_EVENT = "player_recording";
export const SUBMIT_VOTE_EVENT = "player_vote";
export const SUBMIT_CHAT_MESSAGE = "player_chat_message";

export const MAX_CHAT_HISTORY_LENGTH = 200;
export const MAX_CHARS_PER_CHAT_MESSAGE = 160;

export const MIN_PLAYER_ALIAS_LENGTH = 3;
export const MAX_PLAYER_ALIAS_LENGTH = 10;

export const MIN_PLAYER_PASSWORD_LENGTH = 10;
export const MAX_PLAYER_PASSWORD_LENGTH = 256;

export const MIN_C_OCTAVE = 1;
export const MAX_C_OCTAVE = 7;
export const MIDDLE_C_OCTAVE = 3;
export const MIN_NOTE_NUMBER = 24;
export const MAX_NOTE_NUMBER = 108;

export const MIN_FORCED_VOTING_WINDOW_TIME = 20;

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

// ms threshold for which to actually diagnose client's clock as out of sync
export const CLOCK_OUT_OF_SYNC_THRESHOLD = 0;
export const DEFAULT_INPUT_LAG_COMPENSATION = 10;
export const DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH = 2;
export const DEFAULT_SAMPLE_BPM = 90;
export const DEFAULT_SAMPLE_MEASURES = 4;
export const DEFAULT_SAMPLE_LENGTH =
  (60 / DEFAULT_SAMPLE_BPM) * 4 * DEFAULT_SAMPLE_MEASURES;
export const DEFAULT_NUM_WARMUP_LOOPS = 1;
export const DEFAULT_NUM_RECORDED_LOOPS = 1;
export const DEFAULT_RECORDING_LENGTH =
  DEFAULT_SAMPLE_LENGTH * DEFAULT_NUM_RECORDED_LOOPS;
export const DEFAULT_WARMUP_LENGTH =
  DEFAULT_SAMPLE_LENGTH * DEFAULT_NUM_WARMUP_LOOPS;

export const DEFAULT_SAMPLE_VOLUME = -3;

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
  volume: -4.5,
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
    release: 0.3,
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

export const DEFAULT_SAMPLER_SYNTH = {
  volume: -0.1,
  attack: 0.01,
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3",
  },
  release: 1,
  baseUrl:
    "https://progressions-game.s3.amazonaws.com/synths/salamander_grand/",
};

export const DEFAULT_MANUAL_NOTE_VELOCITY = 100;

// room creation parameters
export const MIN_ROOM_SIZE = 2;
export const MAX_ROOM_SIZE = 10;
export const DEFAULT_ROOM_SIZE = 4;

export const MIN_NUM_ROUNDS = 1;
export const MAX_NUM_ROUNDS = 10;
export const DEFAULT_NUM_ROUNDS = 3;

export const MIN_ROOM_NAME_LENGTH = 3;
export const MAX_ROOM_NAME_LENGTH = 20;

export const MIN_SOUND_VOLUME = -25.0;
export const MAX_SOUND_VOLUME = 2.5;
export const DEFAULT_SOUND_VOLUME = -0.5;

export const DEFAULT_ALERT_LIFETIME = 5_000;

export const MAX_INPUT_LAG_COMP = 500;

export const PRACTICE_MODE_TIMESTEP_SIZE = 50;
export const PRACTICE_MODE_QUANTIZE_THRESHOLD = 0.5;

export const DEFAULT_QUANTIZATION_SIZE = 166666 / 2;

export const SOUND_VOLUME_COOKIE = "midimatches_soundvolume";
export const SHOW_KEYBOARD_LABELS_COOKIE = "midimatches_keyboardlabels";
export const SEEN_BROWSER_WARNING_COOKIE = "midimatches_seenbrowserwarning";
export const DISABLED_MIDI_INPUTS_COOKIE = "midimatches_disabledmidiinputs";
export const INPUT_LAG_COMPENSATION_COOKIE = "midimatches_inputlagcompensation";
export const ENABLE_QUANTIZATION_COOKIE = "midimatches_enablequantization";
