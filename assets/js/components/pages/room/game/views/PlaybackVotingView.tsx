import React, { useEffect } from "react";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import { useGameContext, useToneAudioContext } from "../../../../../hooks";
import { PlaybackAudio } from "../../../../audio";
import { SimpleButton, Timer } from "../../../../common";

interface PlaybackVotingViewProps {
  isJudge: boolean;
  pushMessageToChannel: Function;
  contestants: string[];
  playSample: Function;
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  isJudge,
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
  const { Tone } = useToneAudioContext();

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

  return isJudge ? (
    <div>
      <h3>PlaybackVoting View</h3>
      {!!playbackVotingTimeout ? (
        <Timer
          descriptionText={"Voting ends in "}
          duration={playbackVotingTimeout}
        />
      ) : (
        <></>
      )}
      {!!recordings ? (
        Object.entries(recordings).map(
          ([musicianId, recording]: [string, any]) => {
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
          }
        )
      ) : (
        <div>No recordings available</div>
      )}
    </div>
  ) : (
    <div>WAITING FOR VOTES...</div>
  );
};
export { PlaybackVotingView };
