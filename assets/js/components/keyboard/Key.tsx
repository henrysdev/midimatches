import React from "react";

interface KeyProps {
  noteName: string;
  midiNoteNumber: number;
}

const Key: React.FC<KeyProps> = ({midiNoteNumber, noteName}) => {
  let sharpOffset = 0;
  let sharp = noteName.length === 3
  if (sharp) {
    const [letter, _, octave] = noteName.split('');
    console.log(letter);
    console.log(octave);
    sharpOffset = sharpLetterToSharpOffset(letter, parseInt(octave));
  }

  return (
    <>
    {
      sharp
        ? <div
            style={{left: `${sharpOffset}%`}}
            data-midi-note={midiNoteNumber}
            data-note-name={noteName}
            className={"key sharp"}
          >
            {sharpOffset}
            </div>
        : <div
            data-midi-note={midiNoteNumber}
            data-note-name={noteName}
            className={"key"}
          />
    }
    </>
  );
};
export { Key };

const sharpLetterToSharpOffset = (letter: string, octave: number): number => {
  let stepOffset = 0;
  const keyWidthPercentage = 1/52 * 100;

  switch(letter) {
    case 'A':
      stepOffset = 1.4;
      break;
    case 'C':
      stepOffset = 5;
      break;
    case 'D':
      stepOffset = 7;
      break;
    case 'F':
      stepOffset = 11;
      break;
    case 'G':
      stepOffset = 13;
      break;
    default:
      stepOffset = -1990;
  }

  octave *= (keyWidthPercentage * 7);
  return octave + stepOffset - (keyWidthPercentage * 7);
}
