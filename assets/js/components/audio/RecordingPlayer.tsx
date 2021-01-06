import React, { useContext, useEffect, useState } from 'react';
import * as Tone from 'tone';

import { GameContext } from '../../contexts';
import { GameContextType, Loop } from '../../types';
import { loopToEvents } from '../../utils';
import { SimpleButton } from '../common';

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
  const { timestepSize, soloTimeLimit }: GameContextType = useContext(
    GameContext
  );

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

  return (
    <SimpleButton
      label={`Playback recording for MusicianId ${musicianId}`}
      callback={() =>
        scheduleRecording(
          recording,
          Tone.now(),
          timestepSize,
          soloTimeLimit,
          playNote
        )
      }
      disabled={false}
    />
  );
};
export { RecordingPlayer };

function scheduleRecording(
  recording: Loop,
  startTime: number,
  timestepSize: number,
  soloTimeLimit: number,
  playNote: Function
): void {
  Tone.Transport.start(startTime);
  const noteEvents = loopToEvents(recording, startTime, timestepSize);
  console.log("noteEvents: ", noteEvents);
  const part = new Tone.Part((time: number, { note, velocity }) => {
    playNote(note, time, velocity);
  }, noteEvents);
  // part.set({
  //   loop: true,
  //   loopStart: recording.timestepSlices[0].timestep,
  //   loopEnd: soloTimeLimit,
  // });
  part.start(0);
}
