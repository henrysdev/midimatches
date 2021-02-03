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

export const VIEW_UPDATE_EVENT = "view_update";
export const START_GAME_EVENT = "start_game";
export const RESET_ROOM_EVENT = "reset_room";
export const INIT_CONN_EVENT = "init_conn";

export const SUBMIT_ENTER_ROOM = "musician_enter_room";
export const SUBMIT_LEAVE_ROOM = "musician_leave_room";
export const SUBMIT_READY_UP_EVENT = "musician_ready_up";
export const SUBMIT_RECORDING_EVENT = "musician_recording";
export const SUBMIT_VOTE_EVENT = "musician_vote";

export const SAMPLE_URLS = ["/sounds/ragga_sample.mp3"];

export const DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH = 2;
export const DEFAULT_SAMPLE_LENGTH = 10.6667;
export const DEFAULT_NUM_RECORDED_LOOPS = 1;
export const DEFAULT_RECORDING_LENGTH =
  DEFAULT_SAMPLE_LENGTH * DEFAULT_NUM_RECORDED_LOOPS;

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
    release: 1.5,
  },
  volume: 3,
  portamento: 0.05,
} as Tone.SynthOptions;
