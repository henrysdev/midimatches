import React, { useEffect, useState, useMemo } from "react";
import * as Tone from "tone";

import { Loop, Color } from "../../types";
import { loopToEvents } from "../../utils";
import { Button } from "../common";
import {
  DEFAULT_NUM_RECORDED_LOOPS,
  DEFAULT_RECORDING_LENGTH,
} from "../../constants";
import { useGameRulesContext, useToneAudioContext } from "../../hooks";
import { scheduleSamplePlay } from "../../helpers";
import { RecordingVisual } from "./";

interface PlaybackAudioProps {
  recording: Loop;
  playerId: string;
  stopSample: Function;
  color: Color;
  submitVote: Function;
  setActivePlaybackTrack: Function;
  isPlaying: boolean;
  listenComplete: boolean;
  completeListening: Function;
  canVote: boolean;
  emptyRecording: boolean;
  autoPlayingId?: string;
  practiceMode?: boolean;
}

const PlaybackAudio: React.FC<PlaybackAudioProps> = ({
  recording,
  playerId,
  stopSample,
  color,
  submitVote,
  setActivePlaybackTrack,
  isPlaying,
  listenComplete,
  completeListening,
  canVote,
  emptyRecording,
  autoPlayingId,
  practiceMode = false,
}) => {
  const {
    gameRules: { timestepSize },
  } = useGameRulesContext();

  const [progress, setProgress] = useState<number>(0);
  const { synth, samplePlayer } = useToneAudioContext();

  useEffect(() => {
    return () => {
      Tone.Transport.cancel(0);
    };
  }, []);

  useEffect(() => {
    if (!!autoPlayingId && autoPlayingId === playerId) {
      playbackMusician(timestepSize, playNote);
    }
  }, [autoPlayingId]);

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
    Tone.start();
    const startTime = Tone.now();
    Tone.Transport.cancel(0);
    Tone.Transport.start(startTime);

    const part = buildPart(recording, timestepSize, playNote);

    startPlayheadProgress(startTime);

    if (!!samplePlayer && !!samplePlayer.loop) {
      console.log("Playback stage - set back to loop = false");
      samplePlayer.loop = false;
    }

    samplePlayer.stop(`+0`);
    samplePlayer.seek(0);

    samplePlayer.start(`+0.1`);
    part.start(`+0.1`);
  };

  const startPlayheadProgress = (startTime: number): void => {
    setActivePlaybackTrack(playerId);
    setProgress(0);

    Tone.Transport.scheduleRepeat(
      (currTime) => {
        const progress = (currTime - startTime) / DEFAULT_RECORDING_LENGTH;
        if (progress >= 0.99) {
          completeListening(playerId);
          setProgress(1.0);
        } else {
          setProgress(progress);
        }
      },
      0.05,
      "+0",
      DEFAULT_RECORDING_LENGTH
    );
  };

  const startManualPlayback = () => {
    if (!autoPlayingId) {
      playbackMusician(timestepSize, playNote);
    }
  };

  const cssClasses = useMemo(() => {
    let classes = ["recording_playback"];
    if (!canVote) {
      classes.push("frozen");
    } else {
      classes.push("highlight_on_hover");
    }
    return [...classes].join(" ");
  }, [isPlaying, listenComplete, canVote]);

  return (
    <div style={{ padding: "8px" }}>
      {!practiceMode ? <div className="roboto_font">Anonymous</div> : <></>}
      <div style={{ display: "flex" }}>
        <div className={cssClasses} onClick={() => startManualPlayback()}>
          <div
            style={{
              display: "flex",
            }}
          >
            {!canVote ? (
              <div
                style={{
                  width: "32px",
                }}
              >
                {isPlaying ? (
                  <i
                    style={{ verticalAlign: "middle", color: "blue" }}
                    className="material-icons"
                  >
                    hearing
                  </i>
                ) : listenComplete ? (
                  <i
                    style={{ verticalAlign: "middle", color: "green" }}
                    className="material-icons"
                  >
                    check_circle_outline
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
            ) : (
              <></>
            )}

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
                emptyRecording={emptyRecording}
                firstPlayback={autoPlayingId === playerId}
                listenComplete={listenComplete}
              />
            </div>
          </div>
        </div>

        {!practiceMode && canVote ? (
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
                submitVote(playerId);
                stopSample();
              }}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
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
