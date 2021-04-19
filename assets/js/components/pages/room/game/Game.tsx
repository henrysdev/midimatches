import React, { useEffect, useState, useMemo } from "react";
import { Channel } from "phoenix";

import * as Tone from "tone";
import { GAME_VIEW } from "../../../../constants";
import { GameContext } from "../../../../contexts";
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
  } = useToneAudioContext();

  const [joinedMidRecording, setJoinedMidRecording] = useState<boolean>(true);

  const currSampleBeat = useMemo(() => {
    return gameContext.sampleBeats[gameContext.roundNum - 1];
  }, [gameContext.roundNum]);

  const sampleName = useMemo(() => {
    return currSampleBeat.name;
  }, [currSampleBeat]);

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        setJoinedMidRecording(false);
        loadSample(currSampleBeat.fileUrl);
        break;
      case GAME_VIEW.RECORDING:
        loadSample(currSampleBeat.fileUrl);
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        setJoinedMidRecording(false);
        loadSample(currSampleBeat.fileUrl);
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

  return (
    <GameContext.Provider value={gameContext}>
      <GameSubContexts gameContext={gameContext}>
        <InGameFrame
          title="GAME"
          subtitle={`${roomName} / FREE-FOR-ALL / ROUND ${gameContext.roundNum}`}
          textRight={isAudienceMember ? "[AUDIENCE]" : ""}
          textRightClass={
            isAudienceMember ? "audience_member_role_text" : "player_role_text"
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
                    sampleName={sampleName}
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
                return <RoundEndView />;

              case GAME_VIEW.GAME_END:
                return <GameEndView />;
            }
          })()}
        </InGameFrame>
      </GameSubContexts>
    </GameContext.Provider>
  );
};
export { Game };
