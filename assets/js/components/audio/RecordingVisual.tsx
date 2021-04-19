import React, { useEffect, useMemo, useRef } from "react";
import { Loop, TimestepSlice, Note, Color, Seconds } from "../../types";
import { useGameRulesContext, useBackingTrackContext } from "../../hooks";
import { microsToMs, msToSec } from "../../utils";
import { MAX_NOTE_NUMBER, MIN_NOTE_NUMBER } from "../../constants";

interface RecordingVisualProps {
  recording: Loop;
  color: Color;
  progress: number;
  isPlaying: boolean;
  emptyRecording: boolean;
  firstPlayback: boolean;
  listenComplete: boolean;
}

const keyboardRange = MAX_NOTE_NUMBER - MIN_NOTE_NUMBER;

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

  const { recordingTime, backingTrack } = useBackingTrackContext();

  const recordedNotes = useMemo(
    () => flattenTimestepSlices(recording.timestepSlices),
    [recording.timestepSlices.length]
  );

  const canvasRef = useRef<any>(null);
  useEffect(() => {
    if (!!canvasRef && !!canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      canvasCtx.canvas.width = canvasWidth;
      canvasCtx.canvas.height = canvasHeight;

      const { pixelsPerTimestep, pixelsPerKey } = calcPixelUnits(
        keyboardRange,
        timestepSize,
        canvasWidth,
        canvasHeight,
        recordingTime
      );

      recordedNotes.map((notePoint) =>
        drawNotePointOnCanvas(
          notePoint,
          pixelsPerTimestep,
          pixelsPerKey,
          "var(--text_dark)",
          canvasRef
        )
      );
    }
  }, [canvasRef]);

  return emptyRecording ? (
    <div className="piano_roll_container empty_recording_roll">
      <div
        className="roboto_font empty_recording_label large_instructions_text"
        style={{ color: "black" }}
      >
        (Empty Recording)
      </div>
      {isPlaying ? (
        drawProgress(progress, firstPlayback)
      ) : listenComplete ? (
        <></>
      ) : (
        drawClockedRecording()
      )}
    </div>
  ) : (
    <div className="piano_roll_container">
      <canvas
        className="piano_roll_container"
        style={{
          backgroundColor: color,
        }}
        ref={canvasRef}
      ></canvas>
      <div className="piano_roll_playhead_container">
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

const calcPixelUnits = (
  keyboardRange: number,
  timestepSize: number,
  canvasWidth: number,
  canvasHeight: number,
  recordingTime: Seconds
): { pixelsPerTimestep: number; pixelsPerKey: number } => {
  const timestepSizeInSeconds = msToSec(microsToMs(timestepSize));
  const numTotalTimesteps = Math.floor(recordingTime / timestepSizeInSeconds);
  const pixelsPerTimestep = canvasWidth / numTotalTimesteps;
  const pixelsPerKey = canvasHeight / keyboardRange;
  return { pixelsPerTimestep, pixelsPerKey };
};

const drawNotePointOnCanvas = (
  notePoint: NotePoint,
  pixelsPerTimestep: number,
  pixelHeightPerKey: number,
  color: string,
  canvasRef: any
): void => {
  const pixelStartX = notePoint.timestep * pixelsPerTimestep;
  const pixelStartY = (MAX_NOTE_NUMBER - notePoint.key) * pixelHeightPerKey;
  const pixelDuration = notePoint.duration * pixelsPerTimestep;

  const canvasCtx = canvasRef.current.getContext("2d");
  canvasCtx.beginPath();
  canvasCtx.rect(pixelStartX, pixelStartY, pixelDuration, pixelHeightPerKey);
  canvasCtx.fillRect(
    pixelStartX,
    pixelStartY,
    pixelDuration,
    pixelHeightPerKey
  );
  canvasCtx.stroke();
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
