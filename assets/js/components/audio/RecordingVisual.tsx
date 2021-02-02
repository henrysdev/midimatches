import React, { useState, useMemo } from "react";
import { Loop, TimestepSlice, Note, Color } from "../../types";
import { useGameContext } from "../../hooks";
import { microsToMs, msToSec } from "../../utils";
import { DEFAULT_RECORDING_LENGTH } from "../../constants";

interface RecordingVisualProps {
  recording: Loop;
  color: Color;
}

const containerWidth = 400;
const containerHeight = 40;
const keyboardRange = 100;

const RecordingVisual: React.FC<RecordingVisualProps> = ({
  recording,
  color,
}) => {
  const {
    gameRules: { timestepSize },
  } = useGameContext();

  const { pixelsPerTimestep, pixelsPerKey } = useMemo(
    () =>
      calcPixelUnits(
        containerWidth,
        containerHeight,
        keyboardRange,
        timestepSize
      ),
    [containerWidth, containerHeight, timestepSize, keyboardRange]
  );

  return (
    <div
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight,
        border: "1px solid black",
      }}
    >
      {flattenTimestepSlices(recording.timestepSlices).map((notePoint) =>
        drawNotePoint(notePoint, pixelsPerTimestep, pixelsPerKey, color)
      )}
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

const calcPixelUnits = (
  containerWidth: number,
  containerHeight: number,
  keyboardRange: number,
  timestepSize: number
): { pixelsPerTimestep: number; pixelsPerKey: number } => {
  const timestepSizeInSeconds = msToSec(microsToMs(timestepSize));
  const numTotalTimesteps = Math.floor(
    DEFAULT_RECORDING_LENGTH / timestepSizeInSeconds
  );
  const pixelsPerTimestep = containerWidth / numTotalTimesteps;
  const pixelsPerKey = containerHeight / keyboardRange;
  return { pixelsPerTimestep, pixelsPerKey };
};

const drawNotePoint = (
  notePoint: NotePoint,
  pixelsPerTimestep: number,
  pixelsPerKey: number,
  color: string
): JSX.Element => {
  const pixelStartX = notePoint.timestep * pixelsPerTimestep;
  const pixelStartY = notePoint.key * pixelsPerKey;
  const pixelDuration = notePoint.duration * pixelsPerTimestep;

  return (
    <div
      key={`${notePoint.timestep}_${notePoint.key}`}
      style={{
        position: "absolute",
        width: pixelDuration,
        height: pixelsPerKey,
        backgroundColor: color,
        left: pixelStartX,
        bottom: pixelStartY,
      }}
    ></div>
  );
};
