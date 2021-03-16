import React, { useState, useMemo, useEffect, useRef } from "react";

import {
  SUBMIT_VOTE_EVENT,
  DEFAULT_RECORDING_LENGTH,
} from "../../../../../constants";
import {
  useGameContext,
  usePlayerContext,
  useClockOffsetContext,
} from "../../../../../hooks";
import { PlaybackAudio } from "../../../../audio";
import {
  SimpleButton,
  Timer,
  TimerBox,
  Instructions,
  DynamicContent,
  MediumLargeTitle,
} from "../../../../common";
import { shuffleArray, genRandomColors } from "../../../../../utils";
import { Color, Loop, RecordingTuple } from "../../../../../types";
import { calcMsUntilMsTimestamp, secToMs } from "../../../../../utils";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  stopSample: Function;
  isSamplePlayerLoaded: boolean;
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  stopSample,
  isSamplePlayerLoaded,
}) => {
  const {
    recordings: allRecordings,
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
    viewDeadline,
  } = useGameContext();
  const { clockOffset } = useClockOffsetContext();

  const { player: currPlayer } = usePlayerContext();
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();
  const [listenCompleteTracks, setListenCompleteTracks] = useState<Set<string>>(
    new Set<string>()
  );
  const [emptyRecordings, setEmptyRecordings] = useState<Set<string>>(
    new Set<string>()
  );

  const recordings = useMemo(() => {
    return !!allRecordings ? allRecordings : [];
  }, []);

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = !!recordings ? Object.keys(recordings).length : 0;
    return genRandomColors(numColorsNeeded);
  }, []);

  // auto play
  const [autoPlayingTrackIdx, setAutoPlayingTrackIdx] = useState<number>(-1);
  const autoPlayCounter = useRef(null) as any;

  useEffect(() => {
    if (isSamplePlayerLoaded) {
      if (autoPlayingTrackIdx === -1) {
        setAutoPlayingTrackIdx((idx) => idx + 1);
      }

      if (autoPlayingTrackIdx < recordings.length) {
        autoPlayCounter.current = setTimeout(() => {
          setAutoPlayingTrackIdx((idx) => idx + 1);
        }, secToMs(DEFAULT_RECORDING_LENGTH));
      }
    }

    return () => {
      clearTimeout(autoPlayCounter.current);
    };
  }, [autoPlayingTrackIdx, isSamplePlayerLoaded]);

  const autoPlayingId = useMemo(() => {
    return !!recordings &&
      recordings.length > autoPlayingTrackIdx &&
      autoPlayingTrackIdx >= 0
      ? recordings[autoPlayingTrackIdx][0]
      : undefined;
  }, [autoPlayingTrackIdx]);

  useEffect(() => {
    const emptyMusicians = recordings
      .filter(([_playerId, recording]) => recording.timestepSlices.length === 0)
      .map(([playerId, _recording]) => playerId);
    const emptyMusiciansSet = new Set(emptyMusicians);
    setEmptyRecordings(emptyMusiciansSet);
    setListenCompleteTracks(
      new Set([...listenCompleteTracks, ...emptyMusicians])
    );
  }, []);

  const canVote: boolean = useMemo(() => {
    return listenCompleteTracks.size >= recordings.length;
  }, [listenCompleteTracks.size]);

  const completeListening = (playerId: string) => {
    const updatedListenCompleteTracksSet = new Set([
      ...listenCompleteTracks,
      ...[playerId],
    ]);
    setListenCompleteTracks(updatedListenCompleteTracksSet);
  };

  const submitVote = (playerId: string): void => {
    const sentMessage = pushMessageToChannel(SUBMIT_VOTE_EVENT, {
      vote: playerId,
    });
    if (!!sentMessage) {
      sentMessage
        .receive("ok", (_reply: any) => {
          console.log("vote submission successful");
          setVoteSubmitted(true);
        })
        .receive("vote submission error", (err: any) => {
          console.error(err);
        });
    }
  };

  return (
    <div className="view_container">
      <MediumLargeTitle>LISTEN AND VOTE</MediumLargeTitle>
      <DynamicContent>
        {voteSubmitted ? (
          <></>
        ) : (
          <Instructions
            description="Listen through other players' recordings. Once all 
        recordings have been heard you will be able to cast a vote for your favorite."
          />
        )}
        {voteSubmitted ? (
          <p style={{ textAlign: "center" }}>
            Vote submitted successfully. Waiting on other players...
          </p>
        ) : !!recordings ? (
          recordings
            .map((recordingTuple: RecordingTuple, idx: number): [
              RecordingTuple,
              Color
            ] => {
              return [recordingTuple, randomColors[idx]];
            })
            .map(([[playerId, recording], color]: [RecordingTuple, Color]) => {
              return (
                <div key={`playback-${playerId}`}>
                  <PlaybackAudio
                    key={`player-${playerId}`}
                    isCurrPlayer={
                      !!currPlayer && currPlayer.playerId === playerId
                    }
                    recording={recording}
                    playerId={playerId}
                    stopSample={stopSample}
                    color={color}
                    submitVote={submitVote}
                    setActivePlaybackTrack={setActivePlaybackTrack}
                    isPlaying={activePlaybackTrack === playerId}
                    listenComplete={listenCompleteTracks.has(playerId)}
                    canVote={canVote}
                    completeListening={completeListening}
                    emptyRecording={emptyRecordings.has(playerId)}
                    autoPlayingId={autoPlayingId}
                  />
                </div>
              );
            })
        ) : (
          <div>No recordings available</div>
        )}
      </DynamicContent>
      <TimerBox>
        {!!playbackVotingTimeout ? (
          <Timer
            descriptionText={"Voting ends in "}
            duration={calcMsUntilMsTimestamp(viewDeadline) + clockOffset}
          />
        ) : (
          <></>
        )}
      </TimerBox>
    </div>
  );
};
export { PlaybackVotingView };
