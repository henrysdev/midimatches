import React, { useContext, useEffect, useState } from "react";
import * as Tone from "tone";

import { GameContext } from "../../contexts";
import { GameContextType, Loop, SamplePlayer } from "../../types";
import { loopToEvents } from "../../utils";
import { SimpleButton } from "../common";

interface RecordingPlayerProps {
  recording: Loop;
  musicianId: string;
  scheduledStartTime: number;
  samplePlayer: SamplePlayer;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  musicianId,
  scheduledStartTime,
  samplePlayer,
}) => {
  const {
    gameRules: { timestepSize, soloTimeLimit },
  } = useContext(GameContext) as GameContextType;

  const [synth, setSynth] = useState<Tone.Synth>();

  useEffect(() => {
    // TODO break out into instrument class
    setSynth(new Tone.Synth().toDestination());
  }, []);

  const playNote = (note: number, time: number, velocity: number) => {
    console.log("PLAY NOTE. time: ", time);
    if (!!synth) {
      synth.triggerAttackRelease(note, "8n", time, velocity);
    }
  };

  return !!samplePlayer ? (
    <SimpleButton
      label={`Playback recording for MusicianId ${musicianId}`}
      callback={() =>
        scheduleRecording(
          recording,
          Tone.now(),
          timestepSize,
          soloTimeLimit,
          playNote,
          samplePlayer
        )
      }
      disabled={false}
    />
  ) : (
    <div></div>
  );
};
export { RecordingPlayer };

function scheduleRecording(
  recording: Loop,
  startTime: number,
  timestepSize: number,
  _soloTimeLimit: number,
  playNote: Function,
  samplePlayer: Tone.Player
): void {
  Tone.Transport.start(startTime);

  const part = buildPart(recording, timestepSize, playNote);

  part.start();
  samplePlayer.start();
}

function buildPart(
  recording: Loop,
  timestepSize: number,
  playNote: Function
): Tone.Part {
  const noteEvents = loopToEvents(recording, 0, timestepSize);
  console.log("noteEvents: ", noteEvents);
  console.log("currentTime: ", Tone.now());
  const part = new Tone.Part((time: number, { note, velocity }) => {
    playNote(note, time, velocity);
  }, noteEvents);
  return part;
}
