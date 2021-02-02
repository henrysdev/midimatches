import React, { useEffect } from "react";

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
import { shuffleArray } from "../../../../../utils";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  contestants: string[];
  playSample: Function;
}

const desc = `
Listen through all other players recordings and vote on your favorite. The 
recordings have been anonymized and will be played in a random order. Once 
you have heard all the recordings, you will be able to cast your vote.
`;

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  contestants,
  playSample,
}) => {
  const {
    recordings,
    gameRules: {
      viewTimeouts: { playbackVoting: playbackVotingTimeout },
    },
  } = useGameContext();

  const { player: currPlayer } = usePlayerContext();

  useEffect(() => {
    if (!!recordings) {
      // TODO automatically schedule all to fully playback
      // Object.entries(recordings).reduce((now, [musicianId, recording]) => {
      //   scheduleRecording(ß
      //     recording,
      //     now,
      //     timestepSize,
      //     soloTimeLimit,
      //     playNote
      //   );
      //   return now + soloTimeLimit;
      // }, Tone.now());
    }
  }, [recordings]);

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
            .map(([musicianId, recording]: [string, any]) => {
              return (
                <div key={`playback-${musicianId}`}>
                  <PlaybackAudio
                    key={`player-${musicianId}`}
                    recording={recording}
                    musicianId={musicianId}
                    playSample={playSample}
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
            })
        ) : (
          <div>No recordings available</div>
        )}
      </DynamicContent>
      <Instructions description={desc} />
    </div>
  );
};
export { PlaybackVotingView };
