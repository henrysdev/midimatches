import React, { useEffect, useState } from "react";
import * as Tone from "tone";

import { Loop } from "../../types";
import { loopToEvents } from "../../utils";
import { SimpleButton } from "../common";
import {
  DEFAULT_SYNTH_CONFIG,
  DEFAULT_NUM_RECORDED_LOOPS,
} from "../../constants";
import { useGameContext } from "../../hooks";
import { scheduleSampleLoop } from "../../helpers";

interface PlaybackAudioProps {
  recording: Loop;
  musicianId: string;
  playSample: Function;
}

const PlaybackAudio: React.FC<PlaybackAudioProps> = ({
  recording,
  musicianId,
  playSample,
}) => {
  const {
    gameRules: { timestepSize, soloTimeLimit },
  } = useGameContext();

  const [synth, setSynth] = useState<Tone.PolySynth>();

  useEffect(() => {
    // TODO break out into instrument class
    const newSynth = new Tone.PolySynth(DEFAULT_SYNTH_CONFIG).toDestination();
    setSynth(newSynth);
  }, []);

  const playNote = (
    note: number,
    duration: number,
    time: number,
    velocity: number
  ) => {
    if (!!synth) {
      synth.triggerAttackRelease(
        note,
        Math.max(0.000000000001, duration),
        time,
        velocity
      );
    }
  };

  return (
    <SimpleButton
      label={`Playback recording for MusicianId ${musicianId}`}
      callback={() =>
        playbackMusician(
          recording,
          timestepSize,
          soloTimeLimit,
          playNote,
          playSample
        )
      }
      disabled={false}
    />
  );
};
export { PlaybackAudio };

function playbackMusician(
  recording: Loop,
  timestepSize: number,
  _soloTimeLimit: number,
  playNote: Function,
  playSample: Function
): void {
  const startTime = Tone.now();
  Tone.Transport.cancel(0);
  Tone.Transport.start(startTime);

  const part = buildPart(recording, timestepSize, playNote);

  part.start();
  scheduleSampleLoop(0, playSample, DEFAULT_NUM_RECORDED_LOOPS, true);
}

function buildPart(
  recording: Loop,
  timestepSize: number,
  playNote: Function
): Tone.Part {
  const noteEvents = loopToEvents(recording, 0, timestepSize);
  const part = new Tone.Part((time: number, { note, duration, velocity }) => {
    playNote(note, duration, time, velocity);
  }, noteEvents);
  return part;
}
