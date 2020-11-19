import { LoopTimestepQueue } from './timestepqueue';
import { Loop, Musician, TimestepSlice } from '../types';

const defaultLoop: Loop = {
  start_timestep: 0,
  length: 8,
  timestep_slices: [
    {
      timestep: 0,
      notes: [
        {
          instrument: 'bassoon',
          key: 3,
          duration: 1,
        }
      ]
    },
    {
      timestep: 1,
      notes: [
        {
          instrument: 'bassoon',
          key: 4,
          duration: 1,
        }
      ]
    },
    {
      timestep: 2,
      notes: [
        {
          instrument: 'bassoon',
          key: 5,
          duration: 3,
        }
      ]
    },
    {
      timestep: 3,
      notes: [
        {
          instrument: 'bassoon',
          key: 5,
          duration: 2,
        }
      ]
    },
    {
      timestep: 4,
      notes: [
        {
          instrument: 'bassoon',
          key: 5,
          duration: 1,
        }
      ]
    },
    {
      timestep: 5,
      notes: [
        {
          instrument: 'bassoon',
          key: 5,
          duration: 1,
        }
      ]
    },
    {
      timestep: 6,
      notes: [
        {
          instrument: 'bassoon',
          key: 5,
          duration: 1,
        }
      ]
    }
  ]
}
const defaultMusicianId = '1000'

test('simulates playback queue', () => {
  const defaultMusician: Musician = {
    musician_id: defaultMusicianId,
    loop: defaultLoop,
  }

  const ltq = new LoopTimestepQueue();
  ltq.addMusician(defaultMusician);
  const timestepSlicesEachTimestep: {timestep: number, slices: TimestepSlice[]}[] = [];
  for(let currTimestep = 0; currTimestep < defaultLoop.length * 2; currTimestep++) {
    const dueTimesteps = ltq.getDueTimestepSlices(currTimestep);
    timestepSlicesEachTimestep.push({timestep: currTimestep, slices: dueTimesteps});
  }

  console.log("SLICES EACH TIMESTEP", timestepSlicesEachTimestep);
})

test('addMusician adds musician to map successfully', () => {
  const defaultMusician: Musician = {
    musician_id: defaultMusicianId,
    loop: defaultLoop,
  }
  const expectedMusiciansMap: {[key: string]: Musician} = {
    [defaultMusicianId]: defaultMusician,
  }

  const ltq = new LoopTimestepQueue();
  ltq.addMusician(defaultMusician);
  ltq.getDueTimestepSlices(0);

  expect(ltq.musiciansMap).toEqual(expectedMusiciansMap)
});

describe("updateMusicianLoop", () => {
  const newLoop: Loop = {
    start_timestep: 2,
    length: 4,
    timestep_slices: [
      {
        timestep: 1,
        notes: [
          {
            instrument: 'trumpet',
            key: 4,
            duration: 1,
          },
          {
            instrument: 'trumpet',
            key: 2,
            duration: 1,
          }
        ]
      }
    ]
  }
  test("updates a loop for an existing musician", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    ltq.getDueTimestepSlices(0);
    ltq.updateMusicianLoop(newLoop, defaultMusicianId);
    ltq.getDueTimestepSlices(1);

    expect(ltq.musiciansMap[defaultMusicianId].loop).toEqual(newLoop);
  });
  test("does nothing when musicianId does not exist in musicians map", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    ltq.getDueTimestepSlices(0);
    ltq.updateMusicianLoop(newLoop, "another-musician-id");
    ltq.getDueTimestepSlices(1);

    expect(ltq.musiciansMap[defaultMusicianId].loop).toEqual(defaultLoop);
  });
});

describe("getDueTimestepSlices", () => {
  test("when some timestep slices are due", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }
    const expectedTimestepSlices: TimestepSlice[] = defaultLoop.timestep_slices.slice(0,3);

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    const timestepSlices = ltq.getDueTimestepSlices(2);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when 1 timestep slice is due", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }
    const expectedTimestepSlices: TimestepSlice[] = defaultLoop.timestep_slices.slice(0,1);

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    const timestepSlices = ltq.getDueTimestepSlices(0);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when all timestep slices are due", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }
    const expectedTimestepSlices: TimestepSlice[] = defaultLoop.timestep_slices;

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    const timestepSlices = ltq.getDueTimestepSlices(100);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
  test("when no timestep slices are due", () => {
    const defaultMusician: Musician = {
      musician_id: defaultMusicianId,
      loop: defaultLoop,
    }
    const expectedTimestepSlices: TimestepSlice[] = [];

    const ltq = new LoopTimestepQueue();
    ltq.addMusician(defaultMusician);
    const timestepSlices = ltq.getDueTimestepSlices(-1);

    expect(timestepSlices).toEqual(expectedTimestepSlices);
  });
});
