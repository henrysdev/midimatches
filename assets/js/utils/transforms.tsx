import { GAME_VIEW } from "../constants";
import { Loop, Note, LocalNoteEvent } from "../types";
// import * as Tone from "tone";

const isArray = function (a: Array<any>): boolean {
  return Array.isArray(a);
};

const isObject = function (o: Object): boolean {
  return o === Object(o) && !isArray(o) && typeof o !== "function";
};

const keysToCamel = function (o: Object): Object {
  if (isObject(o)) {
    const n = {} as Object;

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};

const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

function midiToPitchClass(midi: number): string {
  const scaleIndexToNote = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const note = midi % 12;
  return scaleIndexToNote[note];
}

export function midiToPitch(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return midiToPitchClass(midi) + octave.toString();
}

export function unmarshalBody(payload: Object): Object {
  return keysToCamel(payload);
}

export function gameViewAtomToEnum(atom: string): any {
  switch (atom) {
    case "pregame_lobby":
      return GAME_VIEW.PREGAME_LOBBY;
    case "game_start":
      return GAME_VIEW.GAME_START;
    case "round_start":
      return GAME_VIEW.ROUND_START;
    case "recording":
      return GAME_VIEW.RECORDING;
    case "playback_voting":
      return GAME_VIEW.PLAYBACK_VOTING;
    case "round_end":
      return GAME_VIEW.ROUND_END;
    case "game_end":
      return GAME_VIEW.GAME_END;
  }
}

export function loopToEvents(
  loop: Loop,
  now: number,
  timestepSize: number
): LocalNoteEvent[] {
  return loop.timestepSlices.reduce(
    (accEvents: LocalNoteEvent[], timestepSlice, idx) => {
      const timestepSizeInSeconds = 0.000001 * timestepSize;
      const { timestep, notes } = timestepSlice;
      const events = notes.map(({ key, instrument, duration }: Note) => {
        const note = midiToPitch(key);
        return {
          time: now + timestepSizeInSeconds * timestep,
          note,
          velocity: 0.2,
        } as LocalNoteEvent;
      });
      return accEvents.concat(events);
    },
    []
  );
}
