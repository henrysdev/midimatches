import * as Tone from "tone";
import {
  DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
} from "../constants";
import { Milliseconds, Seconds } from "../types";
import { msToSec, secToMs } from "../utils";

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

interface ScheduleDeadlines {
  sampleStartTime: Seconds;
  recordingStartTime: Seconds;
  recordingEndTime: Seconds;
}

export function scheduleRecordingDeadlines(
  serverSendTimestamp: Milliseconds,
  playSample: Function,
  startRecording: Function,
  stopRecording: Function
) {
  // calculate deadlines
  const {
    sampleStartTime,
    recordingStartTime,
    recordingEndTime,
  } = calcRecordingDeadlines(
    serverSendTimestamp,
    DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
    DEFAULT_SAMPLE_LENGTH,
    DEFAULT_RECORDING_LENGTH,
    Tone,
    Date
  );

  // start sample
  Tone.Transport.scheduleOnce((time: Seconds) => {
    console.log("TODO trigger immediate sample start ", time);
  }, sampleStartTime);

  // start recording
  Tone.Transport.scheduleOnce((time: Seconds) => {
    console.log("TODO trigger immediate recording start ", time);
  }, recordingStartTime);

  // stop recording + sample
  Tone.Transport.scheduleOnce((time: Seconds) => {
    console.log("TODO trigger immediate recording stop + sample stop ", time);
  }, recordingEndTime);
}

export function calcRecordingDeadlines(
  serverSendTimestamp: Milliseconds, // ex: 1610577790924
  bufferTime: Seconds, // ex: 5
  sampleTime: Seconds, // ex: 10
  recordingTime: Seconds, // ex: 30
  tone: any,
  date: any
): ScheduleDeadlines {
  const nowUtc: Milliseconds = date.now();
  const nowTone: Seconds = tone.now();

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
