import React, { useEffect, useState, useMemo } from "react";
import * as Tone from "tone";

import { Loop, Color } from "../../types";
import { loopToEvents } from "../../utils";
import { Button } from "../common";
import {
  DEFAULT_NUM_RECORDED_LOOPS,
  DEFAULT_RECORDING_LENGTH,
} from "../../constants";
import { useGameContext, useToneAudioContext } from "../../hooks";
import { scheduleSampleLoop } from "../../helpers";
import { RecordingVisual } from "./";

interface PlaybackAudioProps {
  recording: Loop;
  musicianId: string;
  playSample: Function;
  stopSample: Function;
  color: Color;
  submitVote: Function;
  setActivePlaybackTrack: Function;
  isPlaying: boolean;
  listenComplete: boolean;
  completeListening: Function;
  canVote: boolean;
}

const PlaybackAudio: React.FC<PlaybackAudioProps> = ({
  recording,
  musicianId,
  playSample,
  stopSample,
  color,
  submitVote,
  setActivePlaybackTrack,
  isPlaying,
  listenComplete,
  completeListening,
  canVote,
}) => {
  const {
    gameRules: { timestepSize },
  } = useGameContext();

  const [progress, setProgress] = useState<number>(0);
  const { synth } = useToneAudioContext();
  const [hovering, setHovering] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      Tone.Transport.cancel(0);
    };
  }, []);

  const playNote = (
    note: number,
    duration: number,
    time: number,
    velocity: number
  ) => {
    if (!!synth) {
      synth.triggerAttackRelease(
        note,
        Math.max(0.000000000001, duration),
        time,
        velocity
      );
    }
  };

  const playbackMusician = (timestepSize: number, playNote: Function): void => {
    const startTime = Tone.now();
    Tone.Transport.cancel(0);
    Tone.Transport.start(startTime);

    const part = buildPart(recording, timestepSize, playNote);

    part.start();
    startPlayheadProgress(startTime);
    scheduleSampleLoop(0, playSample, DEFAULT_NUM_RECORDED_LOOPS, true);
  };

  const startPlayheadProgress = (startTime: number): void => {
    setActivePlaybackTrack(musicianId);
    setProgress(0);

    Tone.Transport.scheduleRepeat(
      (currTime) => {
        const progress = (currTime - startTime) / DEFAULT_RECORDING_LENGTH;
        if (progress >= 0.99) {
          completeListening(musicianId);
          setProgress(0);
        } else {
          setProgress(progress);
        }
      },
      0.05,
      "+0",
      DEFAULT_RECORDING_LENGTH
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          flex: "5",
          padding: "8px",
          margin: "auto",
          marginTop: "4px",
          border: "1px solid #666",
          boxShadow: "0 5px 5px rgb(0 0 0 / 8%)",
          color: "#666",
          cursor: "pointer",
          backgroundColor: hovering ? "#f8f8f8" : "white",
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => playbackMusician(timestepSize, playNote)}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <div
            style={{
              width: "32px",
            }}
          >
            {isPlaying ? (
              listenComplete ? (
                <i
                  style={{ verticalAlign: "middle", color: "green" }}
                  className="material-icons"
                >
                  hearing
                </i>
              ) : (
                <i
                  style={{ verticalAlign: "middle", color: "blue" }}
                  className="material-icons"
                >
                  hearing
                </i>
              )
            ) : listenComplete ? (
              <i
                style={{ verticalAlign: "middle", color: "green" }}
                className="material-icons"
              >
                hearing
              </i>
            ) : (
              <i
                style={{ verticalAlign: "middle", color: "red" }}
                className="material-icons"
              >
                hearing_disabled
              </i>
            )}
          </div>
          <div
            style={{
              flex: "5",
            }}
          >
            <RecordingVisual
              recording={recording}
              color={color}
              progress={progress}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>

      {canVote ? (
        <div
          style={{
            flex: "1",
            padding: "8px",
            margin: "auto",
            marginTop: "4px",
            height: "100%",
            width: "100%",
          }}
        >
          <Button
            label="Vote"
            callback={() => {
              submitVote(musicianId);
              stopSample();
            }}
            disabled={false}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
export { PlaybackAudio };

function buildPart(
  recording: Loop,
  timestepSize: number,
  playNote: Function
): Tone.Part {
  const noteEvents = loopToEvents(recording, 0, timestepSize);
  const part = new Tone.Part((time: number, { note, duration, velocity }) => {
    playNote(note, duration, time, velocity);
  }, noteEvents);
  return part;
}
