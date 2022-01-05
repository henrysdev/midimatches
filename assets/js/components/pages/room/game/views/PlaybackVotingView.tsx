import React, { useState, useMemo, useEffect, useRef } from "react";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import {
  useGameContext,
  usePlayerContext,
  useClockOffsetContext,
  useBackingTrackContext,
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
import { shuffleArray, genRandomColors, msToSec } from "../../../../../utils";
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
    players: allPlayers,
  } = useGameContext();
  const { clockOffset } = useClockOffsetContext();
  const { recordingTime } = useBackingTrackContext();

  const { player: currPlayer } = usePlayerContext();
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  const [canVote, setCanVote] = useState<boolean>(false);
  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();
  const [listenCompleteTracks, setListenCompleteTracks] = useState<Set<string>>(
    new Set<string>()
  );
  const [emptyRecordings, setEmptyRecordings] = useState<Set<string>>(
    new Set<string>()
  );

  const players = useMemo(() => {
    return !!allPlayers ? allPlayers : [];
  }, []);

  const validRecordings = useMemo(() => {
    return !!allRecordings ? allRecordings : [];
  }, []);

  const recordingPlayerIdsSet = useMemo(() => {
    return !!validRecordings
      ? new Set(validRecordings.map(([playerId, _recording]) => playerId))
      : new Set([]);
  }, []);

  const emptyMusicianIds = useMemo(() => {
    return players
      .map((player) => player.playerId)
      .filter((playerId) => !recordingPlayerIdsSet.has(playerId));
  }, []);

  const playbackRecordings = useMemo(() => {
    const emptyRecordingFakes = emptyMusicianIds.map((id) => {
      return [
        id,
        {
          timestepSlices: [],
          timestepSize: 0,
        } as Loop,
      ] as RecordingTuple;
    });
    return validRecordings.concat(emptyRecordingFakes);
  }, []);

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = !!playbackRecordings
      ? Object.keys(playbackRecordings).length
      : 0;
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

      if (autoPlayingTrackIdx < playbackRecordings.length) {
        autoPlayCounter.current = setTimeout(() => {
          setAutoPlayingTrackIdx((idx) => idx + 1);
        }, secToMs(recordingTime));
      } else {
        setCanVote(true);
      }
    }

    return () => {
      clearTimeout(autoPlayCounter.current);
    };
  }, [autoPlayingTrackIdx, isSamplePlayerLoaded]);

  const autoPlayingId = useMemo(() => {
    return !!playbackRecordings &&
      playbackRecordings.length - emptyRecordings.size > autoPlayingTrackIdx &&
      autoPlayingTrackIdx >= 0
      ? playbackRecordings[autoPlayingTrackIdx][0]
      : undefined;
  }, [autoPlayingTrackIdx]);

  useEffect(() => {
    const emptyMusicianIdsSet = new Set(emptyMusicianIds);
    setEmptyRecordings(emptyMusicianIdsSet);
    setListenCompleteTracks(
      new Set([...listenCompleteTracks, ...emptyMusicianIds])
    );
  }, []);

  useEffect(() => {
    if (listenCompleteTracks.size >= playbackRecordings.length) {
      setCanVote(true);
    }
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
      <DynamicContent
        centeredStyles={
          !!validRecordings && validRecordings.length > 0
            ? { height: "100%" }
            : {}
        }
      >
        {!!validRecordings && validRecordings.length > 0 ? (
          <div>
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
            ) : (
              <div className="playback_recordings_container">
                {playbackRecordings
                  .map((recordingTuple: RecordingTuple, idx: number): [
                    RecordingTuple,
                    Color
                  ] => {
                    return [recordingTuple, randomColors[idx]];
                  })
                  .map(
                    ([[playerId, recording], color]: [
                      RecordingTuple,
                      Color
                    ]) => {
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
                    }
                  )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", height: "100%" }}>
            <Instructions description="Skipping voting... no submissions from active players :( " />
          </div>
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
