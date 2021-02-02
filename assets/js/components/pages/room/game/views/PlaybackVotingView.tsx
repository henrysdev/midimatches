import React, { useEffect, useMemo } from "react";

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
Listen through all other players recordings and vote on your favorite. The 
recordings have been anonymized and will be played in a random order. Once 
you have heard all the recordings, you will be able to cast your vote.
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

  const randomColors: Array<Color> = useMemo(() => {
    const numColorsNeeded = Object.keys(recordings).length;
    return genRandomColors(numColorsNeeded);
  }, [Object.keys(recordings).length]);

  // useEffect(() => {
  //   if (!!recordings) {
  //     // TODO automatically schedule all to fully playback
  //   }
  // }, [Object.keys(recordings).length]);

  return (
    <div>
      <Title title="Playback Voting" />
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
                    />
                    <div>
                      <SimpleButton
                        key={`vote-${musicianId}`}
                        label={`Vote for ${musicianId}`}
                        callback={() => {
                          pushMessageToChannel(SUBMIT_VOTE_EVENT, {
                            vote: musicianId,
                          });
                        }}
                        disabled={false}
                      />
                    </div>
                  </div>
                );
              }
            )
        ) : (
          <div>No recordings available</div>
        )}
      </DynamicContent>
      <Instructions description={desc} />
    </div>
  );
};
export { PlaybackVotingView };
