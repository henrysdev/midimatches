import React, { useContext, useEffect } from "react";
import * as Tone from "tone";

import { SUBMIT_VOTE_EVENT } from "../../../../../constants";
import { GameContext } from "../../../../../contexts";
import { GameContextType, SamplePlayer } from "../../../../../types";
import { RecordingPlayer } from "../../../../audio";
import { SimpleButton } from "../../../../common";

interface PlaybackVotingViewProps {
  isJudge: boolean;
  pushMessageToChannel: Function;
  contestants: string[];
  samplePlayer: SamplePlayer;
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  isJudge,
  pushMessageToChannel,
  contestants,
  samplePlayer,
}) => {
  const { recordings } = useContext(GameContext) as GameContextType;

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
      {contestants.map((musicianId: string) => {
        return (
          <div key={`${musicianId}`}>
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
            {!!recordings ? (
              Object.entries(recordings).map(
                ([musicianId, recording]: [string, any]) => {
                  return (
                    <RecordingPlayer
                      key={`recording-player-${musicianId}`}
                      recording={recording}
                      musicianId={musicianId}
                      scheduledStartTime={Tone.now()}
                      samplePlayer={samplePlayer}
                    />
                  );
                }
              )
            ) : (
              <div>No recordings available</div>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <div>WAITING FOR VOTES...</div>
  );
};
export { PlaybackVotingView };
