import React, { useEffect, useState, useMemo } from "react";
import * as Tone from "tone";

import { Loop, Color, Playhead } from "../../types";
import { loopToEvents } from "../../utils";
import { SimpleButton } from "../common";
import {
  DEFAULT_SYNTH_CONFIG,
  DEFAULT_NUM_RECORDED_LOOPS,
  DEFAULT_RECORDING_LENGTH,
} from "../../constants";
import { useGameContext } from "../../hooks";
import { scheduleSampleLoop } from "../../helpers";
import { RecordingVisual } from "./";

interface PlaybackAudioProps {
  recording: Loop;
  musicianId: string;
  playSample: Function;
  color: Color;
  submitVote: Function;
  setActivePlaybackTrack: Function;
  isPlaying: boolean;
}

const PlaybackAudio: React.FC<PlaybackAudioProps> = ({
  recording,
  musicianId,
  playSample,
  color,
  submitVote,
  setActivePlaybackTrack,
  isPlaying,
}) => {
  const {
    gameRules: { timestepSize, soloTimeLimit },
  } = useGameContext();

  const [synth, setSynth] = useState<Tone.PolySynth>();

  const [progress, setProgress] = useState<number>(0);

  // TODO inherit this from tone audio context...
  useEffect(() => {
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

  const playbackMusician = (timestepSize: number, playNote: Function): void => {
    const startTime = Tone.now();
    Tone.Transport.cancel(0);
    Tone.Transport.start(startTime);

    const part = buildPart(recording, timestepSize, playNote);

    part.start();
    startPlayheadProgress(startTime);
    scheduleSampleLoop(0, playSample, DEFAULT_NUM_RECORDED_LOOPS, true);
  };

  const startPlayheadProgress = (startTime: number): void => {
    setActivePlaybackTrack(musicianId);
    setProgress(0);

    Tone.Transport.scheduleRepeat(
      (currTime) => {
        const progress = (currTime - startTime) / DEFAULT_RECORDING_LENGTH;
        setProgress(progress);
      },
      0.05,
      "+0",
      DEFAULT_RECORDING_LENGTH
    );
  };

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          flex: "5",
        }}
      >
        <RecordingVisual
          recording={recording}
          color={color}
          progress={progress}
          isPlaying={isPlaying}
        />
      </div>
      <div style={{ flex: "1" }}>
        <SimpleButton
          key={`play-track-${musicianId}`}
          label={"Play"}
          callback={() => playbackMusician(timestepSize, playNote)}
          disabled={false}
        />
      </div>
      <div style={{ flex: "1" }}>
        <SimpleButton
          key={`vote-${musicianId}`}
          label={"Vote"}
          callback={() => submitVote(musicianId)}
          disabled={false}
        />
      </div>
    </div>
  );
};
export { PlaybackAudio };

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
