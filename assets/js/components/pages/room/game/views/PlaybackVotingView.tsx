import React, { useState, useMemo } from "react";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import { useGameContext, usePlayerContext } from "../../../../../hooks";
import { PlaybackAudio } from "../../../../audio";
import {
  SimpleButton,
  Timer,
  Instructions,
  DynamicContent,
  Title,
} from "../../../../common";
import { shuffleArray, genRandomColors } from "../../../../../utils";
import { Color, Loop, RecordingTuple } from "../../../../../types";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  playSample: Function;
}

const desc = `
Listen through the other recordings and vote for your favorite. 
Click on a recording to play it.
`;

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  playSample,
}) => {
  const {
    recordings = [],
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
  } = useGameContext();

  const { player: currPlayer } = usePlayerContext();

  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = Object.keys(recordings).length;
    return genRandomColors(numColorsNeeded);
  }, [Object.keys(recordings).length]);

  const submitVote = (musicianId: string): void => {
    pushMessageToChannel(SUBMIT_VOTE_EVENT, {
      vote: musicianId,
    });
  };

  return (
    <div>
      <Title title="Playback Voting" />
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
        {!!recordings ? (
          recordings
            .filter(
              ([musicianId, _recording]) => musicianId !== currPlayer.musicianId
            )
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
                      color={color}
                      submitVote={submitVote}
                      setActivePlaybackTrack={setActivePlaybackTrack}
                      isPlaying={activePlaybackTrack === musicianId}
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
