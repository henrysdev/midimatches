import React, { useEffect, useState, useMemo } from "react";
import { Channel } from "phoenix";

import * as Tone from "tone";
import { GAME_VIEW } from "../../../../constants";
import { GameContext, BackingTrackContext } from "../../../../contexts";
import {
  GameEndView,
  GameStartView,
  PlaybackVotingView,
  RecordingView,
  RoundEndView,
  RoundStartView,
} from "./views";
import {
  useGameServerState,
  useSamplePlayer,
  usePlayerContext,
  useToneAudioContext,
  useBackingTrackContextProvider,
} from "../../../../hooks";
import { InGameFrame, GameSubContexts } from ".";
import { GameContextType, Milliseconds } from "../../../../types";
import { GameLeftPane, GameRightPane } from ".";
import { AudienceRecordingView } from "./AudienceRecordingView";

interface GameProps {
  gameChannel: Channel;
  initGameState: GameContextType;
  roomName: string;
  clockOffset: Milliseconds;
}

const Game: React.FC<GameProps> = ({
  gameChannel,
  initGameState,
  roomName,
  clockOffset,
}) => {
  const [currentView, gameContext, pushMessage] = useGameServerState(
    gameChannel,
    initGameState,
    clockOffset
  );

  const { isAudienceMember } = usePlayerContext();

  const {
    isSamplePlayerLoaded,
    loadSample,
    stopSample,
    resetTone,
    batchLoadSamples,
  } = useToneAudioContext();

  const [joinedMidRecording, setJoinedMidRecording] = useState<boolean>(true);

  const currBackingTrack = useMemo(() => {
    return gameContext.sampleBeats[gameContext.roundNum - 1];
  }, [gameContext.roundNum]);

  const sampleName = useMemo(() => {
    return currBackingTrack.name;
  }, [currBackingTrack]);

  useEffect(() => {
    if (!!gameContext.sampleBeats) {
      batchLoadSamples(gameContext.sampleBeats.map(({ fileUrl }) => fileUrl));
    }
  }, []);

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        setJoinedMidRecording(false);
        loadSample(currBackingTrack.fileUrl);
        resetTone();
        break;
      case GAME_VIEW.RECORDING:
        loadSample(currBackingTrack.fileUrl);
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        setJoinedMidRecording(false);
        loadSample(currBackingTrack.fileUrl);
        resetTone();
        break;
      case GAME_VIEW.ROUND_END:
        setJoinedMidRecording(false);
        resetTone();
        break;
      case GAME_VIEW.GAME_END:
        setJoinedMidRecording(false);
        resetTone();
        break;
    }
  }, [currentView]);

  const backingTrackContext = useBackingTrackContextProvider(currBackingTrack);

  return (
    <GameContext.Provider value={gameContext}>
      <GameSubContexts gameContext={gameContext}>
        <BackingTrackContext.Provider value={backingTrackContext}>
          <InGameFrame
            title="GAME"
            subtitle={`${roomName} / FREE-FOR-ALL / ROUND ${gameContext.roundNum}`}
            textRight={isAudienceMember ? "[AUDIENCE]" : ""}
            textRightClass={
              isAudienceMember
                ? "audience_member_role_text"
                : "player_role_text"
            }
          >
            <GameLeftPane />
            {(() => {
              switch (currentView) {
                case GAME_VIEW.GAME_START:
                  return <GameStartView pushMessageToChannel={pushMessage} />;

                case GAME_VIEW.ROUND_START:
                  return (
                    <RoundStartView
                      pushMessageToChannel={pushMessage}
                      roundNum={gameContext.roundNum}
                      sampleName={sampleName}
                    />
                  );

                case GAME_VIEW.RECORDING:
                  return !isAudienceMember ? (
                    <RecordingView
                      isContestant={!joinedMidRecording}
                      pushMessageToChannel={pushMessage}
                      stopSample={stopSample}
                    />
                  ) : (
                    <AudienceRecordingView />
                  );

                case GAME_VIEW.PLAYBACK_VOTING:
                  return (
                    <PlaybackVotingView
                      pushMessageToChannel={pushMessage}
                      stopSample={stopSample}
                      isSamplePlayerLoaded={isSamplePlayerLoaded}
                    />
                  );

                case GAME_VIEW.ROUND_END:
                  return (
                    <RoundEndView
                      isSamplePlayerLoaded={isSamplePlayerLoaded}
                      stopSample={stopSample}
                    />
                  );

                case GAME_VIEW.GAME_END:
                  return <GameEndView />;
              }
            })()}
          </InGameFrame>
        </BackingTrackContext.Provider>
      </GameSubContexts>
    </GameContext.Provider>
  );
};
export { Game };
