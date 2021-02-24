import React, { useState, useMemo, useEffect } from "react";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import { useGameContext, usePlayerContext } from "../../../../../hooks";
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
import { calcMsUntilMsTimestamp } from "../../../../../utils";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  stopSample: Function;
}

const desc = `
Listen through other players' recordings. Once all recordings have been heard you will be able to cast a vote for your favorite. 
If voting time expires before you have voted, your vote will be cast randomly.
`;

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  stopSample,
}) => {
  const {
    recordings: allRecordings,
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
    viewDeadline,
  } = useGameContext();

  const { player: currPlayer } = usePlayerContext();
  const [voteSubmitted, setVoteSubmiited] = useState<boolean>(false);
  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();
  const [listenCompleteTracks, setListenCompleteTracks] = useState<Set<string>>(
    new Set<string>()
  );
  const [emptyRecordings, setEmptyRecordings] = useState<Set<string>>(
    new Set<string>()
  );

  const recordings = useMemo(() => {
    return !!allRecordings && !!currPlayer
      ? allRecordings.filter(
          ([playerId, _recording]) => playerId !== currPlayer.playerId
        )
      : [];
  }, [allRecordings, currPlayer]);

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

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = Object.keys(recordings).length;
    return genRandomColors(numColorsNeeded);
  }, [Object.keys(recordings).length]);

  const submitVote = (playerId: string): void => {
    const sentMessage = pushMessageToChannel(SUBMIT_VOTE_EVENT, {
      vote: playerId,
    });
    if (!!sentMessage) {
      sentMessage
        .receive("ok", (_reply: any) => {
          console.log("vote submission successful");
          setVoteSubmiited(true);
        })
        .receive("vote submission error", (err: any) => {
          console.error(err);
        });
    }
  };

  return (
    <div>
      <MediumLargeTitle>LISTEN AND VOTE</MediumLargeTitle>
      <DynamicContent>
        <Instructions description={desc} />
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
            duration={calcMsUntilMsTimestamp(viewDeadline)}
          />
        ) : (
          <></>
        )}
      </TimerBox>
    </div>
  );
};
export { PlaybackVotingView };
