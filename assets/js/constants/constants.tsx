// MIDI codes
export const NOTE_ON = 0x9;
export const NOTE_OFF = 0x8;

// Possible game state views
export const enum GAME_VIEW {
  PREGAME_LOBBY,
  GAME_START,
  RECORDING,
  PLAYBACK_VOTING,
  GAME_END,
}

export const SUBMIT_ENTER_ROOM = "musician_enter_room";
export const SUBMIT_LEAVE_ROOM = "musician_leave_room";
export const SUBMIT_READY_UP_EVENT = "musician_ready_up";
export const SUBMIT_RECORDING_EVENT = "musician_recording";
export const SUBMIT_VOTE_EVENT = "musician_vote";

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
  portamento: 0.05,
};
