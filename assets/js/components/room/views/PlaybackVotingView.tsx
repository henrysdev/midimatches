import React from "react";
import { SimpleButton } from "../../common/index";
import { SUBMIT_VOTE_EVENT } from "../../../constants/index";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  eligibleMusiciansToVoteFor: string[];
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  eligibleMusiciansToVoteFor,
}) => {
  return (
    <div>
      <h3>PlaybackVoting View</h3>
      {eligibleMusiciansToVoteFor.map((musicianId: string) => {
        return (
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
        );
      })}
    </div>
  );
};
export { PlaybackVotingView };
