import React from "react";
import { SimpleButton } from "../../common/index";
import { SUBMIT_VOTE_EVENT } from "../../../constants/index";

interface PlaybackVotingViewProps {
  submitVote: Function;
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  submitVote,
}) => {
  return (
    <div>
      <h3>PlaybackVoting View</h3>
      <SimpleButton
        label="Vote"
        callback={() => {
          submitVote(SUBMIT_VOTE_EVENT, {
            vote: "fakeMusicianId",
          });
        }}
        disabled={false}
      />
    </div>
  );
};
export { PlaybackVotingView };
