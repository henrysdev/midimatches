import { Loop, Note, TimestepSlice, Musician } from "../types";
import { LoopPlaybackManager } from './loopplaybackmanager';

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
const noteLength = 0.09;    // length of "beep" (in seconds)
var timerWorker: Worker;    // The Web Worker used to fire timer messages
var soundBuffer: AudioBuffer;
var loopPlaybackManager: LoopPlaybackManager;

// TODO DEBUG remove
const mocks = require('./mocks.json');
const defaultMusician: Musician = {
  musician_id: "defaultMusicianId",
  loop: mocks.defaultLoop
}
const anotherMusician: Musician = {
  musician_id: "anotherMusicianId",
  loop: mocks.shortLoop
}
const thirdMusician: Musician = {
  musician_id: "thirdMusicianId",
  loop: mocks.longLoop
}


function nextNote() {
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

  // const source = audioContext.createBufferSource();
  // source.buffer = soundBuffer;
  // source.connect(audioContext.destination);

  // if (beatNumber % 16 === 0) {
  //   // beat 0 (start of sequence)
  // } else if (beatNumber % 4 === 0 ) {
  //   // quarter notes of sequence
  // } else {                  
  //   // 16th notes of sequence
  // }

  // source.start(time);
  // source.stop(time + noteLength);

  const dueTimestepSlices: TimestepSlice[] = loopPlaybackManager.getDueTimestepSlices(beatNumber);
  console.log('TIMESTEP: ', beatNumber);
  console.log('DUE TIMESTEPS: ', dueTimestepSlices);

  // create an oscillator
  var osc = audioContext.createOscillator();
  osc.connect( audioContext.destination );
  osc.frequency.value = 220.0; // other 16th notes = low pitch
  if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
    osc.frequency.value = 440.0;
  if (beatNumber % 8 === 0 )    // 8th notes = lowest pitch
    osc.frequency.value = 100.0;
  if (beatNumber % 16 === 0)    // beat 0 == high pitch
    osc.frequency.value = 880.0;                     
  osc.start(time);
  osc.stop(time + noteLength);
}

function scheduler() {
  // TOD0 process loop queue
  // while there are notes that will need to play before the next interval, 
  // schedule them and advance the pointer.
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

function init(){
  audioContext = new AudioContext();
  loopPlaybackManager = new LoopPlaybackManager();

  // TODO debug remove
  loopPlaybackManager.addMusician(defaultMusician);
  loopPlaybackManager.addMusician(anotherMusician);
  loopPlaybackManager.addMusician(thirdMusician);

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
