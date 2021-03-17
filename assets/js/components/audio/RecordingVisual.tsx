import React, { useEffect, useState, useMemo } from "react";
import { Loop, TimestepSlice, Note, Color } from "../../types";
import { useGameRulesContext } from "../../hooks";
import { microsToMs, msToSec } from "../../utils";
import { DEFAULT_RECORDING_LENGTH } from "../../constants";

interface RecordingVisualProps {
  recording: Loop;
  color: Color;
  progress: number;
  isPlaying: boolean;
  emptyRecording: boolean;
  firstPlayback: boolean;
  listenComplete: boolean;
}

const keyboardRange = 100;

const RecordingVisual: React.FC<RecordingVisualProps> = ({
  recording,
  color,
  progress,
  isPlaying,
  emptyRecording,
  firstPlayback,
  listenComplete,
}) => {
  const {
    gameRules: { timestepSize },
  } = useGameRulesContext();

  const { percentagePerTimestep, percentagePerKey } = useMemo(
    () => calcPercentageUnits(keyboardRange, timestepSize),
    [timestepSize, keyboardRange]
  );

  const recordedNotes = useMemo(
    () => flattenTimestepSlices(recording.timestepSlices),
    [recording.timestepSlices.length]
  );

  return emptyRecording ? (
    <div className="piano_roll_container empty_recording_roll">
      <div className="roboto_font empty_recording_label">(Empty Recording)</div>
      {isPlaying ? (
        drawProgress(progress, firstPlayback)
      ) : listenComplete ? (
        <></>
      ) : (
        drawClockedRecording()
      )}
    </div>
  ) : (
    <div
      className="piano_roll_container"
      style={{
        backgroundColor: color,
      }}
    >
      <div>
        {recordedNotes.map((notePoint) =>
          drawNotePointByPercentages(
            notePoint,
            percentagePerTimestep,
            percentagePerKey,
            "var(--text_dark)"
          )
        )}
        {isPlaying ? (
          drawProgress(progress, firstPlayback)
        ) : listenComplete ? (
          <></>
        ) : (
          drawClockedRecording()
        )}
      </div>
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

const drawProgress = (progress: number, firstPlayback: boolean) => {
  return (
    <div
      className={
        firstPlayback
          ? "playback_progress cloaked_recording_fill"
          : "playback_progress"
      }
      style={{
        width: `${100 - progress * 100}%`,
        borderLeft: `${progress > 0 && progress < 1 ? "2px solid red" : ""}`,
      }}
    ></div>
  );
};

const drawClockedRecording = () => {
  return (
    <div
      className={"playback_progress cloaked_recording_fill"}
      style={{ width: "100%" }}
    ></div>
  );
};
