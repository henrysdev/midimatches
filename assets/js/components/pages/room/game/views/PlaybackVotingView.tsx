import React, { useState, useMemo, useEffect } from "react";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import { useGameContext, usePlayerContext } from "../../../../../hooks";
import { PlaybackAudio } from "../../../../audio";
import {
  SimpleButton,
  Timer,
  Instructions,
  DynamicContent,
  MediumLargeTitle,
} from "../../../../common";
import { shuffleArray, genRandomColors } from "../../../../../utils";
import { Color, Loop, RecordingTuple } from "../../../../../types";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  playSample: Function;
  stopSample: Function;
}

const desc = `
Listen through all other players' recordings and vote for your favorite. You 
must listen through each recording at least once before you are able to vote. 
If voting time expires before you have cast a vote, your vote will be automatically 
cast for a random player.
`;

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  playSample,
  stopSample,
}) => {
  const {
    recordings: allRecordings,
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
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
          ([musicianId, _recording]) => musicianId !== currPlayer.musicianId
        )
      : [];
  }, [allRecordings, currPlayer]);

  useEffect(() => {
    const emptyMusicians = recordings
      .filter(
        ([_musicianId, recording]) => recording.timestepSlices.length === 0
      )
      .map(([musicianId, _recording]) => musicianId);
    const emptyMusiciansSet = new Set(emptyMusicians);
    setEmptyRecordings(emptyMusiciansSet);
    setListenCompleteTracks(
      new Set([...listenCompleteTracks, ...emptyMusicians])
    );
  }, []);

  const canVote: boolean = useMemo(() => {
    return listenCompleteTracks.size >= recordings.length;
  }, [listenCompleteTracks.size]);

  const completeListening = (musicianId: string) => {
    const updatedListenCompleteTracksSet = new Set([
      ...listenCompleteTracks,
      ...[musicianId],
    ]);
    setListenCompleteTracks(updatedListenCompleteTracksSet);
  };

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = Object.keys(recordings).length;
    return genRandomColors(numColorsNeeded);
  }, [Object.keys(recordings).length]);

  const submitVote = (musicianId: string): void => {
    const sentMessage = pushMessageToChannel(SUBMIT_VOTE_EVENT, {
      vote: musicianId,
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
      <MediumLargeTitle title="Playback Voting" />
      <Instructions description={desc} />
      <DynamicContent>
        {!!playbackVotingTimeout ? (
          <Timer
            descriptionText={"Voting ends in "}
            duration={playbackVotingTimeout}
          />
        ) : (
          <></>
        )}
        {voteSubmitted ? (
          <div>Vote submitted successfully. Waiting on other players...</div>
        ) : !!recordings ? (
          recordings
            .map((recordingTuple: RecordingTuple, idx: number): [
              RecordingTuple,
              Color
            ] => {
              return [recordingTuple, randomColors[idx]];
            })
            .map(
              ([[musicianId, recording], color]: [RecordingTuple, Color]) => {
                return (
                  <div key={`playback-${musicianId}`}>
                    <PlaybackAudio
                      key={`player-${musicianId}`}
                      recording={recording}
                      musicianId={musicianId}
                      playSample={playSample}
                      stopSample={stopSample}
                      color={color}
                      submitVote={submitVote}
                      setActivePlaybackTrack={setActivePlaybackTrack}
                      isPlaying={activePlaybackTrack === musicianId}
                      listenComplete={listenCompleteTracks.has(musicianId)}
                      canVote={canVote}
                      completeListening={completeListening}
                      emptyRecording={emptyRecordings.has(musicianId)}
                    />
                  </div>
                );
              }
            )
        ) : (
          <div>No recordings available</div>
        )}
      </DynamicContent>
    </div>
  );
};
export { PlaybackVotingView };
