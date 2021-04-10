import { loopToEvents, midiToPitch } from "./";
import { INPUT_LAG_COMPENSATION } from "../constants";

const loopMocks = require("../mocks/loops.json");

describe("loopToEvents", () => {
  test("successfully casts a Loop to a list of events", () => {
    const inputLoop = loopMocks.classicalLoopRH;
    const now = 0;
    const timestepSize = 1_000_000;
    const expectedEvents = [
      {
        time: now + INPUT_LAG_COMPENSATION,
        note: midiToPitch(72),
        velocity: 1,
        duration: 1,
      },
      {
        time: 8 + INPUT_LAG_COMPENSATION,
        note: midiToPitch(76),
        velocity: 0,
        duration: 2,
      },
      {
        time: 12 + INPUT_LAG_COMPENSATION,
        note: midiToPitch(79),
        velocity: 0.7480314960629921,
        duration: 1,
      },
    ];

    const events = loopToEvents(
      inputLoop,
      now,
      timestepSize,
      INPUT_LAG_COMPENSATION
    );

    expect(events).toStrictEqual(expectedEvents);
  });
});
