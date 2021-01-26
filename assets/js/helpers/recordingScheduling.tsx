import * as Tone from "tone";
import {
  DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
  DEFAULT_NUM_RECORDED_LOOPS,
} from "../constants";
import { Milliseconds, Seconds } from "../types";
import { msToSec, secToMs } from "../utils";

interface ScheduleDeadlines {
  sampleStartTime: Seconds;
  recordingStartTime: Seconds;
  recordingEndTime: Seconds;
}

/**
 *  bufferTime = 5 seconds (the max time allowed for all clients to get view update)
 *  sampleTime = 10 seconds (the duration of the sample clip)
 *  recordTime = 30 seconds (the duration of the recording. Should be a multiple of the sampleTime)
 *
 *  serverSendTime      +5s              +15s             +45s
 *      | <-bufferTime-> | <-sampleTime-> | <-recordTime-> |
 *      |----------------|----------------|----------------|
 *      |                |                |                |
 *  view update    start sample    start recording    stop recording
 *
 *  view update - The client receives the push event to advance to the recording
 *                view. the serverSendTime field is included in the payload. The
 *                serverSendTime field is a UTC millisecond timestamp. The sample
 *                start will be scheduled for serverSendTime + bufferTime. To
 *                schedule this via ToneJS Transport, this scheduling time will
 *                need to be represented in terms of Transport time. A cast from
 *                UTC time to Transport time will need to take place.
 *
 *  start sample - The sample clip starts playing
 *
 *  start recording - Recording starts. The current timestep is used as timestep 0
 *                    for calculating timesteps.
 *
 *  stop recording - Recording is stopped and submitted.
 */

export function scheduleRecordingDeadlines(
  serverSendTimestamp: number,
  playSample: Function,
  startRecording: Function,
  stopRecording: Function
): void {
  // get deadlines
  const deadlines = calcRecordingDeadlines(
    serverSendTimestamp / 1000,
    DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
    DEFAULT_SAMPLE_LENGTH,
    DEFAULT_RECORDING_LENGTH,
    Date
  );

  // schedule deadlines
  scheduleRecordingAudioTimeline(
    deadlines,
    playSample,
    startRecording,
    stopRecording
  );
}

export function getRecordingStartTimestamp(
  serverSendTimestamp: Milliseconds
): Milliseconds {
  const bufferTime = secToMs(DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH);
  const sampleIntro = secToMs(DEFAULT_SAMPLE_LENGTH);
  const recordingStartTimestamp = Math.abs(
    serverSendTimestamp + bufferTime + sampleIntro
  );
  return recordingStartTimestamp;
}

export function scheduleSampleLoop(
  sampleStartTime: Seconds,
  playSample: Function,
  iterations: number,
  startImmediately: boolean
): void {
  const sampleLoop = new Tone.Loop({
    interval: DEFAULT_SAMPLE_LENGTH,
    iterations,
    callback: (time: Seconds) => {
      console.log("play sample loop iteration callback ", time);
      playSample();
    },
  });

  startImmediately
    ? sampleLoop.start()
    : sampleLoop.start(`+${sampleStartTime}`);
}

function scheduleRecordingAudioTimeline(
  { sampleStartTime, recordingStartTime, recordingEndTime }: ScheduleDeadlines,
  playSample: Function,
  startRecording: Function,
  stopRecording: Function
): void {
  Tone.Transport.start("+0");

  // start sample loop
  const iterations = 1 + DEFAULT_NUM_RECORDED_LOOPS; // one intro iteration + three recorded iterations
  scheduleSampleLoop(sampleStartTime, playSample, iterations, false);

  // start recording
  Tone.Transport.scheduleOnce((time: Seconds) => {
    console.log("recording start callback ", time);
    startRecording();
  }, `+${recordingStartTime}`);

  // stop recording
  Tone.Transport.scheduleOnce((time: Seconds) => {
    console.log("recording stop callback", time);
    stopRecording();
  }, `+${recordingEndTime}`);
}

export function calcRecordingDeadlines(
  serverSendTimestamp: Milliseconds, // ex: 1610577790924
  bufferTime: Seconds, // ex: 5
  sampleTime: Seconds, // ex: 10
  recordingTime: Seconds, // ex: 30
  date: any
): ScheduleDeadlines {
  const nowUtc: Milliseconds = date.now();
  const nowTone: Seconds = 0;

  const timeTilSampleStart = msToSec(
    Math.abs(serverSendTimestamp + secToMs(bufferTime) - nowUtc)
  );

  const sampleStartTime = nowTone + timeTilSampleStart;
  const recordingStartTime = sampleStartTime + sampleTime;
  const recordingEndTime = recordingStartTime + recordingTime;

  return {
    sampleStartTime,
    recordingStartTime,
    recordingEndTime,
  };
}
