import React, { useEffect, useState, useMemo, useRef } from "react";
import * as Tone from "tone";

import { Loop, Color, Milliseconds } from "../../types";
import { loopToEvents, currUtcTimestamp, secToMs } from "../../utils";
import {
  Button,
  ContentButton,
  InlineWidthButton,
  MaterialIcon,
} from "../common";
import {
  useGameRulesContext,
  useToneAudioContext,
  useBackingTrackContext,
} from "../../hooks";
import { scheduleSamplePlay } from "../../helpers";
import { RecordingVisual } from "./";

interface PlaybackAudioProps {
  recording: Loop;
  playerId: string;
  isCurrPlayer: boolean;
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
  isCurrPlayer,
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

  const { recordingTime } = useBackingTrackContext();

  const [progress, setProgress] = useState<number>(0);
  const { synth, samplePlayer } = useToneAudioContext();

  useEffect(() => {
    return () => {
      Tone.Transport.cancel(0);
    };
  }, []);

  useEffect(() => {
    if (!!autoPlayingId && autoPlayingId === playerId) {
      setShouldPlay(true);
    }
  }, [autoPlayingId]);

  const playerTimeRef = useRef(null) as any;
  const [shouldPlay, setShouldPlay] = useState<boolean>(false);
  const [manualPlayCount, setManualPlayCount] = useState<number>(0);

  const cancelPrevTimer = () => {
    if (!!playerTimeRef && !!playerTimeRef.current) {
      clearInterval(playerTimeRef.current);
    }
  };

  useEffect(() => {
    cancelPrevTimer();

    if (shouldPlay) {
      playbackMusician(timestepSize, playNote);
      setActivePlaybackTrack(playerId);
      setProgress(0);

      // playhead update interval
      const playbackStartTime = currUtcTimestamp();
      const timer = () =>
        setInterval(() => {
          const elapsedTime = currUtcTimestamp() - playbackStartTime;
          const progress = elapsedTime / secToMs(recordingTime);
          if (progress >= 0.99) {
            completeListening(playerId);
            setProgress(1.0);
            setShouldPlay(false);
          } else {
            setProgress(progress);
          }
        }, 100);
      playerTimeRef.current = timer();
    }

    return () => {
      cancelPrevTimer();
    };
  }, [shouldPlay, manualPlayCount]);

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

    if (!!samplePlayer && !!samplePlayer.loop) {
      console.log("Playback stage - set back to loop = false");
      samplePlayer.loop = false;
    }

    if (!!samplePlayer && samplePlayer.state === "started") {
      samplePlayer.stop(`+0`);
      samplePlayer.seek(0);
    }

    samplePlayer.start(`+0.05`);
    part.start(`+0.05`);
  };

  const startManualPlayback = () => {
    if (!autoPlayingId) {
      setShouldPlay(true);
      setManualPlayCount((count) => count + 1);
    }
  };

  const cssClasses = useMemo(() => {
    let classes = ["recording_playback"];
    if (canVote) {
      classes.push("highlight_on_hover");
    }
    return [...classes].join(" ");
  }, [isPlaying, listenComplete, canVote]);

  return (
    <div className="recording_playback_wrapper">
      {!practiceMode ? (
        isCurrPlayer ? (
          <div className="roboto_font large_instructions_text">
            <strong>You</strong>
          </div>
        ) : (
          <div className="roboto_font large_instructions_text">Anonymous</div>
        )
      ) : (
        <></>
      )}
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
                {emptyRecording ? (
                  <></>
                ) : isPlaying ? (
                  <MaterialIcon iconName="hearing" style={{ color: "blue" }} />
                ) : listenComplete ? (
                  <MaterialIcon
                    iconName="check_circle_outline"
                    style={{ color: "green" }}
                  />
                ) : (
                  <MaterialIcon
                    iconName="hearing_disabled"
                    style={{ color: "red" }}
                  />
                )}
              </div>
            ) : (
              <></>
            )}

            <div
              style={{
                flex: "5",
                height: "50px",
              }}
            >
              <RecordingVisual
                recording={recording}
                color={isCurrPlayer ? "var(--current_player_color)" : color}
                progress={progress}
                isPlaying={isPlaying}
                emptyRecording={emptyRecording}
                firstPlayback={autoPlayingId === playerId}
                listenComplete={listenComplete}
              />
            </div>
          </div>
        </div>

        {!practiceMode && canVote && !emptyRecording ? (
          <div style={{ flex: "1" }}>
            <InlineWidthButton
              callback={() => {
                submitVote(playerId);
                stopSample();
              }}
              disabled={isCurrPlayer}
              styles={{ marginTop: "4px", marginLeft: "4px" }}
            >
              VOTE
            </InlineWidthButton>
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
