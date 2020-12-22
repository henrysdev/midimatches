import { Musician } from "../types/index";
import { LoopPlaybackManager } from "./loopPlaybackManager";

// how frequently to call scheduling function (ms)
const lookahead = 25.0;
// how far ahead to schedule audio (sec)
const scheduleAheadTime = 0.1;
// length of "beep" (sec)
const noteLength = 0.1;

/**
 * NotePlayer is responsible for the scheduling and playing of notes in the browser
 */
export class NotePlayer {
  // the master audio context to use
  audioContext: AudioContext;
  // what note is currently last scheduled
  currentTimestep: number;
  // tempo (in beats per minute)
  tempo = 60.0;
  // when the next note is due.
  nextNoteTime = 0.0;
  // the web worker used to fire timer messages
  clockWorker: Worker;
  // the loop playback manager to pull from
  loopPlaybackManager: LoopPlaybackManager;

  constructor(loopPlaybackManager: LoopPlaybackManager) {
    this.loopPlaybackManager = loopPlaybackManager;
    this.audioContext = new AudioContext();
    this.clockWorker = new Worker("/js/clockworker.js");
    this.currentTimestep = 0;
  }

  // Start note player
  start() {
    this.clockWorker.addEventListener("message", (e) => {
      if (e.data == "tick") this._runScheduler();
    });
    this.nextNoteTime = this.audioContext.currentTime;
    this.clockWorker.postMessage("start");
    this.clockWorker.postMessage({ interval: lookahead });
  }

  // Indefinitely polls for new notes to schedule
  _runScheduler(): void {
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + scheduleAheadTime
    ) {
      console.log(this.currentTimestep);
      this._scheduleDueNotesForPlay();
      this._nextTimestep();
    }
  }

  // Increment timestep and related fields
  _nextTimestep(): void {
    let secondsPerBeat = 60.0 / (4 * this.tempo);
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.currentTimestep++;
  }

  // Pull due notes to play from loop playback manager and schedule to play them
  _scheduleDueNotesForPlay(): void {
    const dueTimestepSlice = this.loopPlaybackManager.getDueTimestepSlices(
      this.currentTimestep
    );
    dueTimestepSlice.forEach(({ notes }) => {
      notes.forEach(({ key, duration }) => {
        let osc = this.audioContext.createOscillator();
        osc.connect(this.audioContext.destination);
        osc.frequency.value = this._freqFromMidi(key);
        osc.start(this.nextNoteTime);
        osc.stop(this.nextNoteTime + duration * noteLength);
      });
    });
  }

  // Convert from key number (MIDI) to frequency (Hz) for oscillator
  _freqFromMidi(m: number): number {
    return Math.pow(2, (m - 69.0) / 12.0) * 440.0;
  }
}

/* START DEBUG HARNESS */
// build mocked loop playback manager
const loopPlaybackManager = new LoopPlaybackManager();
const mocks = require("./mocks.json");
const defaultMusician: Musician = {
  musicianId: "defaultMusicianId",
  loop: mocks.classicalLoopLH,
};
const defaultMusician1: Musician = {
  musicianId: "defaultMusicianId1",
  loop: mocks.basicBeatLoop,
};
loopPlaybackManager.addMusician(defaultMusician);
loopPlaybackManager.addMusician(defaultMusician1);
setTimeout(() => {
  loopPlaybackManager.updateMusicianLoop(
    mocks.classicalLoopLH,
    defaultMusician1.musicianId
  );
}, 5000);
setTimeout(() => {
  loopPlaybackManager.updateMusicianLoop(
    mocks.classicalLoopRH,
    defaultMusician1.musicianId
  );
}, 7000);
/* END DEBUG HARNESS */

// window.addEventListener("load", init);
const playButton: HTMLButtonElement | null = document.querySelector("#play");
if (!!playButton) {
  playButton.onclick = () => {
    // create note player
    const notePlayer = new NotePlayer(loopPlaybackManager);
    notePlayer.start();
  };
}
