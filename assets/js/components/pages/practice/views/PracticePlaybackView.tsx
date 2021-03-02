import React, { useState, useMemo, useEffect, useRef } from "react";

import {
  SUBMIT_VOTE_EVENT,
  DEFAULT_RECORDING_LENGTH,
} from "../../../../constants";
import { useGameContext, usePlayerContext } from "../../../../hooks";
import { PlaybackAudio } from "../../../audio";
import {
  SimpleButton,
  Timer,
  TimerBox,
  Instructions,
  DynamicContent,
  MediumTitle,
  MediumLargeTitle,
  ComputerButton,
} from "../../../common";
import { secToMs } from "../../../../utils";

interface PracticePlaybackViewProps {
  stopSample: Function;
  isSamplePlayerLoaded: boolean;
  recording: any;
  sampleName: string;
  advanceView: Function;
  playerId?: string;
}

const PracticePlaybackView: React.FC<PracticePlaybackViewProps> = ({
  stopSample,
  isSamplePlayerLoaded,
  recording,
  sampleName,
  advanceView,
  playerId = "_",
}) => {
  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();

  // auto play
  const [autoPlayingTrackIdx, setAutoPlayingTrackIdx] = useState<number>(-1);
  const autoPlayCounter = useRef(null) as any;

  useEffect(() => {
    if (isSamplePlayerLoaded) {
      if (autoPlayingTrackIdx === -1) {
        setAutoPlayingTrackIdx((idx) => idx + 1);
      }
    }

    if (autoPlayingTrackIdx < 2) {
      autoPlayCounter.current = setTimeout(() => {
        setAutoPlayingTrackIdx((idx) => idx + 1);
      }, secToMs(DEFAULT_RECORDING_LENGTH));
    }

    return () => {
      clearTimeout(autoPlayCounter.current);
    };
  }, [autoPlayingTrackIdx, isSamplePlayerLoaded]);

  const autoPlayingId = useMemo(() => {
    return autoPlayingTrackIdx < 1 ? playerId : undefined;
  }, [autoPlayingTrackIdx]);

  return (
    <div>
      <MediumLargeTitle>PRACTICE - PLAYBACK</MediumLargeTitle>
      <MediumTitle>{sampleName}</MediumTitle>
      <DynamicContent>
        {!!recording ? (
          <div>
            <PlaybackAudio
              recording={recording}
              playerId={playerId}
              stopSample={stopSample}
              color={"white"}
              submitVote={() => {}}
              setActivePlaybackTrack={setActivePlaybackTrack}
              isPlaying={true}
              listenComplete={true}
              canVote={true}
              completeListening={() => {}}
              emptyRecording={false}
              autoPlayingId={autoPlayingId}
              practiceMode={true}
            />
          </div>
        ) : (
          <div>No recordings available</div>
        )}
        <ComputerButton callback={() => advanceView()}>
          <h5>CONTINUE</h5>
        </ComputerButton>
      </DynamicContent>
    </div>
  );
};
export { PracticePlaybackView };
