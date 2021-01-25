import React, { useEffect, useState } from "react";
import * as Tone from "tone";

import { Loop } from "../../types";
import { loopToEvents } from "../../utils";
import { SimpleButton } from "../common";
import { DEFAULT_SYNTH_CONFIG } from "../../constants";
import { useGameContext } from "../../hooks";

interface RecordingPlayerProps {
  recording: Loop;
  musicianId: string;
  scheduledStartTime: number;
  playSample: Function;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  musicianId,
  scheduledStartTime,
  playSample,
}) => {
  const {
    gameRules: { timestepSize, soloTimeLimit },
  } = useGameContext();

  const [synth, setSynth] = useState<Tone.Synth>();

  useEffect(() => {
    // TODO break out into instrument class
    const newSynth = new Tone.Synth(DEFAULT_SYNTH_CONFIG).toDestination();
    setSynth(newSynth);
  }, []);

  const playNote = (note: number, time: number, velocity: number) => {
    console.log("PLAY NOTE. time: ", time);
    if (!!synth) {
      synth.triggerAttackRelease(note, "8n", time, velocity);
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
export { RecordingPlayer };

function playbackMusician(
  recording: Loop,
  timestepSize: number,
  _soloTimeLimit: number,
  playNote: Function,
  playSample: Function
): void {
  const startTime = Tone.now();
  Tone.Transport.cancel(startTime);
  Tone.Transport.start(startTime);

  const part = buildPart(recording, timestepSize, playNote);

  part.start();
  playSample();
}

function buildPart(
  recording: Loop,
  timestepSize: number,
  playNote: Function
): Tone.Part {
  const noteEvents = loopToEvents(recording, 0, timestepSize);
  const part = new Tone.Part((time: number, { note, velocity }) => {
    playNote(note, time, velocity);
  }, noteEvents);
  return part;
}
