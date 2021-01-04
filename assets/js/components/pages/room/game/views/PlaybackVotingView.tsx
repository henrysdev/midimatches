import React, { useContext, useEffect, useState } from "react";
import { SimpleButton } from "../../../../common/index";
import { SUBMIT_VOTE_EVENT } from "../../../../../constants/index";
import { GameContext } from "../../../../../contexts/index";
import {
  LoopPlaybackManager,
  NotePlayer,
} from "../../../../../audioplayer/index";
import { loopToEvents } from "../../../../../utils/index";
import { GameContextType, Loop } from "../../../../../types/index";
import * as Tone from "tone";

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  eligibleMusiciansToVoteFor: string[];
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  eligibleMusiciansToVoteFor,
}) => {
  const { recordings }: GameContextType = useContext(GameContext);
  const [
    loopPlaybackManager,
    setLoopPlaybackManager,
  ] = useState<LoopPlaybackManager>();
  const [notePlayer, setNotePlayer] = useState<NotePlayer>();

  useEffect(() => {
    const lpManager = new LoopPlaybackManager();
    const nPlayer = new NotePlayer(lpManager);
    setLoopPlaybackManager(lpManager);
    setNotePlayer(nPlayer);
    // nPlayer.start();
  }, []);

  useEffect(() => {
    if (!!loopPlaybackManager && !!notePlayer && !!recordings) {
      console.log("RECORDINGS: ", recordings);
      // testToneScheduling(recordings);
      Object.entries(recordings).forEach(([musicianId, recording]) => {
        loopPlaybackManager.addMusician({
          musicianId,
          loop: recording,
        });
      });
    }
  }, [recordings]);

  return (
    <div>
      <h3>PlaybackVoting View</h3>
      {eligibleMusiciansToVoteFor.map((musicianId: string) => {
        return (
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
        );
      })}
    </div>
  );
};
export { PlaybackVotingView };
