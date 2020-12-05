import React from "react";
import { Key } from './index';

interface KeyboardProps {}
const Keyboard: React.FC<KeyboardProps> = () => {
  return (
    <div className="keys">
      {
        [...Array(88).keys()].map((i) => {
          const midiNoteNumber = i + 21;
          const noteName = midiNoteNumberToNoteName(midiNoteNumber);
          return (
            <Key
              key={`key-${midiNoteNumber}`}
              midiNoteNumber={midiNoteNumber}
              noteName={noteName}
            />
          );
        })
      }
    </div>
  );
};
export { Keyboard };

const midiNoteNumberToNoteName = (midiNoteId: number): string => {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}