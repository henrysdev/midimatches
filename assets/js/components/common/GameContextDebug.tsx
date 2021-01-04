import React, { useContext } from "react";
import { GameContext } from "../../contexts/index";
import * as Tone from "tone";
import { loopToEvents } from "../../utils/index";
import { SimpleButton } from "./index";

const GameContextDebug: React.FC = () => {
  const gameContext = useContext(GameContext);

  const debugTone = () => {
    const debugLoop = {
      startTimestep: 0,
      length: 24,
      timestepSlices: [
        {
          timestep: 0,
          notes: [
            {
              instrument: "piano",
              key: 65,
              duration: 1,
            },
          ],
        },
        {
          timestep: 2,
          notes: [
            {
              instrument: "piano",
              key: 83,
              duration: 1,
            },
          ],
        },
        {
          timestep: 4,
          notes: [
            {
              instrument: "piano",
              key: 19,
              duration: 1,
            },
          ],
        },
        {
          timestep: 6,
          notes: [
            {
              instrument: "piano",
              key: 80,
              duration: 1,
            },
          ],
        },
      ],
    };
    testToneScheduling([debugLoop]);
  };

  return (
    <div>
      <pre>{JSON.stringify(gameContext, null, 2)}</pre>
      <SimpleButton
        label="DEBUG tone"
        callback={() => {
          debugTone();
        }}
        disabled={false}
      />
    </div>
  );
};
export { GameContextDebug };

function testToneScheduling(recordings) {
  // init transport
  Tone.Transport.set({ bpm: 120 });

  // metronome
  const metro = new Tone.Oscillator(440, "sine").toMaster().start();
  Tone.Transport.scheduleRepeat((time) => {
    metro.start(time);
    metro.stop(time + 0.01);
  }, "0:1");

  const timestepSize = 0.05;
  const now = Tone.now();

  // synth part
  const synth = new Tone.Synth().toDestination();
  const noteEvents = Object.entries(recordings).map(
    ([musicianId, recording]) => {
      return loopToEvents(recording, timestepSize, now);
    }
  );
  console.log("NOTE EVENTS: ", noteEvents);
  // const noteEvents = [
  //   { time: now + timestepSize * 0, note: "C3", velocity: 0.2 },
  //   { time: now + timestepSize * 1, note: "C4", velocity: 0.3 },
  //   { time: now + timestepSize * 2, note: "C5", velocity: 0.9 },
  // ];
  const part = new Tone.Part((time: number, { note, velocity }) => {
    synth.triggerAttackRelease(note, "8n", time, velocity);
  }, noteEvents);
  part.set({
    loop: true,
    loopStart: 0,
    loopEnd: 10, //now + noteEvents[noteEvents.length - 1].time * timestepSize,
  });
  part.start(now);

  Tone.Transport.start();

  // TODO background sample
  // console.log("ALL EVENTS: ", events);
  // const synth = new Tone.Synth().toDestination();
  // const part = new Tone.Part((time, value) => {
  //   console.log("time: ", time);
  //   console.log("value: ", value);
  //   synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
  // }, events);

  // Tone.Transport.set({ bpm: 45 });
  // Tone.Transport.start();
}
