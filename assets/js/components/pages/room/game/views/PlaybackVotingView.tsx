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
import { Color } from "../../../../../types";

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
    recordings = {},
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
  } = useGameContext();

  const { player: currPlayer } = usePlayerContext();

  const [musicianIdInPlayback, setMusicianIdInPlayback] = useState<string>();

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
          shuffleArray(Object.entries(recordings))
            .filter(
              ([musicianId, _recording]) => musicianId !== currPlayer.musicianId
            )
            .map((entry, idx): [[string, any], string] => {
              return [entry, randomColors[idx]];
            })
            .map(
              ([[musicianId, recording], color]: [[string, any], string]) => {
                return (
                  <div key={`playback-${musicianId}`}>
                    <PlaybackAudio
                      key={`player-${musicianId}`}
                      recording={recording}
                      musicianId={musicianId}
                      playSample={playSample}
                      color={color}
                      submitVote={submitVote}
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
