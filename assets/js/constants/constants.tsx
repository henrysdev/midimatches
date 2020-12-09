// MIDI codes
export const NOTE_ON = 0x9;
export const NOTE_OFF = 0x8;

// Possible game state views
export const enum GAME_VIEW {
  START,
  INPUT_TEST,
  SAMPLE_RECORDING,
  SAMPLE_PLAYBACK,
  VOTING,
  RESULTS,
}

export const SUBMIT_PLAYER_RECORDING_EVENT = "update_musician_loop";
