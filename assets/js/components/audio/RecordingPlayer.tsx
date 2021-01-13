import React, { useContext, useEffect, useState } from "react";
import * as Tone from "tone";

import { GameContext } from "../../contexts";
import { GameContextType, Loop } from "../../types";
import { loopToEvents } from "../../utils";
import { SimpleButton } from "../common";

interface RecordingPlayerProps {
  recording: Loop;
  musicianId: string;
  scheduledStartTime: number;
}

const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  musicianId,
  scheduledStartTime,
}) => {
  const {
    gameRules: { timestepSize, soloTimeLimit },
  } = useContext(GameContext) as GameContextType;

  const [synth, setSynth] = useState<Tone.Synth>();

  // TODO break up sample playback logic
  const [samplePlayer, setPlayer] = useState<Tone.Player>();
  useEffect(() => {
    Tone.Transport.start();
    const samplePlayer = new Tone.Player(
      "/sounds/ragga_sample.mp3"
    ).toDestination();
    setPlayer(samplePlayer);
  }, []);

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
  console.log("recording ", recording);
  const noteEvents = loopToEvents(recording, 0, timestepSize);
  console.log("currTime: ", startTime);
  console.log("noteEvents: ", noteEvents);
  const part = new Tone.Part((time: number, { note, velocity }) => {
    playNote(note, time, velocity);
  }, noteEvents);
  part.debug = true;
  console.log("part: ", part);

  part.start();
  samplePlayer.start();
}
