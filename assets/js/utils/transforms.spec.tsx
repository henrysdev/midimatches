import React from "react";
import { loopToEvents, midiToPitch } from "./";
import { Loop, Note, TimestepSlice, LocalNoteEvent } from "../types";

const loopMocks = require("../mocks/loops.json");

describe("loopToEvents", () => {
  test("successfully casts a Loop to a list of events", () => {
    const inputLoop = loopMocks.classicalLoopRH;
    const now = 0;
    const timestepSize = 1_000_000;
    const expectedEvents = [
      { time: now, note: midiToPitch(72), velocity: 0.2 },
      { time: 8, note: midiToPitch(76), velocity: 0.2 },
      { time: 12, note: midiToPitch(79), velocity: 0.2 },
    ];

    const events = loopToEvents(inputLoop, now, timestepSize);

    expect(events).toStrictEqual(expectedEvents);
  });
});
