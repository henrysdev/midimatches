import { LoopPlaybackManager } from "./loopPlaybackManager";
import { Loop, Musician, TimestepSlice } from "../types/index";

const mocks = require("./mocks.json");
const defaultMusicianId = "1000";

describe("simulates playback", () => {
  test("for one loop", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.shortLoop,
    };

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    const actualTimestepSlicesEachTimestep: TimestepSlice[][] = [];
    for (
      let currTimestep = 0;
      currTimestep < mocks.shortLoop.length * 3;
      currTimestep++
    ) {
      const dueTimesteps = lpm.getDueTimestepSlices(currTimestep);
      actualTimestepSlicesEachTimestep.push(dueTimesteps);
    }

    expect(actualTimestepSlicesEachTimestep).toStrictEqual(
      mocks.expectedTimestepSlicesShortLoop
    );
  });

  test("for multiple loops", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const anotherMusician: Musician = {
      musicianId: "anotherMusicianId",
      loop: mocks.shortLoop,
    };
    const thirdMusician: Musician = {
      musicianId: "thirdMusicianId",
      loop: mocks.longLoop,
    };

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.addMusician(anotherMusician);
    lpm.addMusician(thirdMusician);
    const actualTimestepSliceLengths: number[] = [];
    for (
      let currTimestep = 0;
      currTimestep < mocks.longLoop.length * 3;
      currTimestep++
    ) {
      const dueTimesteps = lpm.getDueTimestepSlices(currTimestep);
      actualTimestepSliceLengths.push(dueTimesteps.length);
    }

    const expectedTimestepSliceLengths = [
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      0,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      0,
      3,
      2,
      1,
      1,
      2,
      2,
      1,
      0,
    ];

    expect(actualTimestepSliceLengths).toStrictEqual(
      expectedTimestepSliceLengths
    );
  });
});

describe("addMusician", () => {
  test("adds musician successfully", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const expectedMusiciansMap: { [key: string]: Musician } = {
      [defaultMusicianId]: defaultMusician,
    };

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.getDueTimestepSlices(0);

    expect(lpm.musiciansMap).toEqual(expectedMusiciansMap);
    expect(lpm.liveLoopMap).toHaveProperty([defaultMusicianId]);
  });
});

describe("updateMusicianLoop", () => {
  test("updates a loop for an existing musician", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.updateMusicianLoop(mocks.shortLoop, defaultMusicianId);
    lpm.getDueTimestepSlices(0);

    expect(lpm.musiciansMap[defaultMusicianId].loop).toEqual(mocks.shortLoop);
  });
  test("does nothing when musicianId does not exist in musicians map", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.getDueTimestepSlices(0);
    lpm.updateMusicianLoop(mocks.shortLoop, "another-musician-id");
    lpm.getDueTimestepSlices(1);

    expect(lpm.musiciansMap[defaultMusicianId].loop).toEqual(mocks.defaultLoop);
  });
});

describe("getDueTimestepSlices", () => {
  test("when some timestep slices are due", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const expectedTimestepSlices: TimestepSlice[] = mocks.defaultLoop.timestep_slices.slice(
      1,
      4
    );

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.getDueTimestepSlices(0);
    const timestepSlices = lpm.getDueTimestepSlices(3);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when 1 timestep slice is due", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const expectedTimestepSlices: TimestepSlice[] = mocks.defaultLoop.timestep_slices.slice(
      0,
      1
    );

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    const timestepSlices = lpm.getDueTimestepSlices(0);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when all timestep slices are due", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const expectedTimestepSlices: TimestepSlice[] = mocks.defaultLoop.timestep_slices.slice(
      1,
      100
    );

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.getDueTimestepSlices(0);
    const timestepSlices = lpm.getDueTimestepSlices(100);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when no timestep slices are due", () => {
    const defaultMusician: Musician = {
      musicianId: defaultMusicianId,
      loop: mocks.defaultLoop,
    };
    const expectedTimestepSlices: TimestepSlice[] = [];

    const lpm = new LoopPlaybackManager();
    lpm.addMusician(defaultMusician);
    lpm.getDueTimestepSlices(0);
    lpm.getDueTimestepSlices(6);
    const timestepSlices = lpm.getDueTimestepSlices(7);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
});
