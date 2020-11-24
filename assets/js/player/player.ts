import { Loop, Note, TimestepSlice, Musician } from "../types";
import { LoopPlaybackManager } from './loopPlaybackManager';

var audioContext: AudioContext;
var currentTimestep: number; // What note is currently last scheduled?
var tempo = 120.0;          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
const noteLength = 0.1;    // length of "beep" (in seconds)
var timerWorker: Worker;    // The Web Worker used to fire timer messages
var soundBuffer: AudioBuffer;
var loopPlaybackManager: LoopPlaybackManager;

// TODO DEBUG remove
const mocks = require('./mocks.json');
const defaultMusician: Musician = {
  musician_id: "defaultMusicianId",
  loop: mocks.classicalLoop
}
const defaultMusician1: Musician = {
  musician_id: "defaultMusicianId1",
  loop: mocks.classicalLoop
}

function freqFromMidi(m: number): number {
  return Math.pow(2, (m-69.0) / 12.0) * 440.0;
}

function nextNote(): void {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    currentTimestep++;
}

function scheduleNote(beatNumber: number, time: number): void {
  if ((noteResolution==1) && (beatNumber%2)) {
    return; // we're not playing non-8th 16th notes
  }
  if ((noteResolution==2) && (beatNumber%4)) {
    return; // we're not playing non-quarter 8th notes
  }

  const dueTimestepSlices: TimestepSlice[] = loopPlaybackManager.getDueTimestepSlices(beatNumber);
  // console.log('TIMESTEP: ', beatNumber);
  // console.log('DUE TIMESTEPS: ', dueTimestepSlices);

  for (let i = 0; i < dueTimestepSlices.length; i++) {
    const timestepSliceToPlay = dueTimestepSlices[i];
    for (let j = 0; j < timestepSliceToPlay.notes.length; j++) {
      var osc = audioContext.createOscillator();
      osc.connect( audioContext.destination );
      const {key, duration } = timestepSliceToPlay.notes[j];
      osc.frequency.value = freqFromMidi(key);
      osc.start(time);
      osc.stop(time + duration * noteLength);
    }
  }
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
    console.log(currentTimestep);
    scheduleNote(currentTimestep, nextNoteTime);
    nextNote();
  }
}

function startPlayback() {
  currentTimestep = 0;
  nextNoteTime = audioContext.currentTime;
  timerWorker.postMessage("start");
  timerWorker.postMessage({"interval": lookahead});
}

function loadSound(soundURL: string) {
  window.fetch(soundURL)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {soundBuffer = audioBuffer;});
}

function init() {
  audioContext = new AudioContext();
  loopPlaybackManager = new LoopPlaybackManager();

  // TODO debug remove
  loopPlaybackManager.addMusician(defaultMusician);

  // TODO load all sounds
  loadSound('/sounds/blip.mp3');

  timerWorker = new Worker("/js/clockworker.js");
  timerWorker.onmessage = function(e) {
    if (e.data == "tick") {
      scheduler();
    }
  };
  startPlayback();
}

// window.addEventListener("load", init);
const playButton: HTMLButtonElement | null = document.querySelector('#play');
if (!!playButton) {
  playButton.onclick = () => init();
}
