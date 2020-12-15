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
