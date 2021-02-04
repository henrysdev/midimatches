import React, { useEffect, useState, useMemo } from "react";
import { Loop, TimestepSlice, Note, Color } from "../../types";
import { useGameContext } from "../../hooks";
import { microsToMs, msToSec } from "../../utils";
import { DEFAULT_RECORDING_LENGTH } from "../../constants";

interface RecordingVisualProps {
  recording: Loop;
  color: Color;
  progress: number;
  isPlaying: boolean;
}

const keyboardRange = 100;

const RecordingVisual: React.FC<RecordingVisualProps> = ({
  recording,
  color,
  progress,
  isPlaying,
}) => {
  const {
    gameRules: { timestepSize },
  } = useGameContext();

  const { percentagePerTimestep, percentagePerKey } = useMemo(
    () => calcPercentageUnits(keyboardRange, timestepSize),
    [timestepSize, keyboardRange]
  );

  const recordedNotes = useMemo(
    () => flattenTimestepSlices(recording.timestepSlices),
    [recording.timestepSlices.length]
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "50px",
        border: "1px solid black",
      }}
    >
      {recordedNotes.map((notePoint) =>
        drawNotePointByPercentages(
          notePoint,
          percentagePerTimestep,
          percentagePerKey,
          color
        )
      )}
      {isPlaying ? drawProgress(progress) : <></>}
    </div>
  );
};
export { RecordingVisual };

interface TimestepData {
  timestep: number;
}

type NotePoint = Note & TimestepData;

const flattenTimestepSlices = (
  timestepSlices: TimestepSlice[]
): NotePoint[] => {
  return timestepSlices.reduce((accNotePoints: NotePoint[], timestepSlice) => {
    const { timestep, notes } = timestepSlice;
    const notePoints = notes.map(({ key, duration, velocity }: Note) => {
      return {
        timestep,
        key,
        velocity,
        duration,
      } as NotePoint;
    });
    return accNotePoints.concat(notePoints);
  }, []);
};

const calcPercentageUnits = (
  keyboardRange: number,
  timestepSize: number
): { percentagePerTimestep: number; percentagePerKey: number } => {
  const timestepSizeInSeconds = msToSec(microsToMs(timestepSize));
  const numTotalTimesteps = Math.floor(
    DEFAULT_RECORDING_LENGTH / timestepSizeInSeconds
  );
  const percentagePerTimestep = 100 / numTotalTimesteps;
  const percentagePerKey = 100 / keyboardRange;
  return { percentagePerTimestep, percentagePerKey };
};

const drawNotePointByPercentages = (
  notePoint: NotePoint,
  percentagePerTimestep: number,
  percentagePerKey: number,
  color: string
): JSX.Element => {
  const pixelStartX = `${notePoint.timestep * percentagePerTimestep}%`;
  const pixelStartY = `${notePoint.key * percentagePerKey}%`;
  const pixelDuration = `${notePoint.duration * percentagePerTimestep}%`;

  return (
    <div
      key={`${notePoint.timestep}_${notePoint.key}`}
      style={{
        position: "absolute",
        width: pixelDuration,
        height: percentagePerKey,
        backgroundColor: color,
        left: pixelStartX,
        bottom: pixelStartY,
      }}
    />
  );
};

const drawProgress = (progress: number) => {
  return (
    <div
      className="playback_progress"
      style={{
        position: "absolute",
        width: `${progress * 100}%`,
        height: "100%",
        backgroundColor: "black",
        left: 0,
        bottom: 0,
      }}
    ></div>
  );
};
