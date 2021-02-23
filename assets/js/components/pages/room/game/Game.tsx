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
} from "../../../../hooks";
import { InGameFrame } from ".";
import { GameContextType } from "../../../../types";

interface GameProps {
  gameChannel: Channel;
  initGameState: GameContextType;
}

const Game: React.FC<GameProps> = ({ gameChannel, initGameState }) => {
  const [currentView, gameContext, pushMessage] = useGameServerState(
    gameChannel,
    initGameState
  );
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);
  const [joinedMidRecording, setJoinedMidRecording] = useState<boolean>(true);

  const currSampleBeat = useMemo(() => {
    return gameContext.sampleBeats[gameContext.roundNum - 1];
  }, [gameContext.roundNum]);

  const resetTone = () => {
    stopSample();
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
  };

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        setJoinedMidRecording(false);
        loadSample(currSampleBeat);
        break;
      case GAME_VIEW.RECORDING:
        loadSample(currSampleBeat);
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        setJoinedMidRecording(false);
        loadSample(currSampleBeat);
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
    <GameContext.Provider value={gameContext} key={currentView}>
      <InGameFrame>
        {(() => {
          switch (currentView) {
            case GAME_VIEW.GAME_START:
              return <GameStartView pushMessageToChannel={pushMessage} />;

            case GAME_VIEW.ROUND_START:
              return (
                <RoundStartView
                  pushMessageToChannel={pushMessage}
                  roundNum={gameContext.roundNum}
                />
              );

            case GAME_VIEW.RECORDING:
              return (
                <RecordingView
                  isContestant={!joinedMidRecording}
                  pushMessageToChannel={pushMessage}
                  playSample={playSample}
                  stopSample={stopSample}
                />
              );

            case GAME_VIEW.PLAYBACK_VOTING:
              return (
                <PlaybackVotingView
                  pushMessageToChannel={pushMessage}
                  playSample={playSample}
                  stopSample={stopSample}
                />
              );

            case GAME_VIEW.ROUND_END:
              return <RoundEndView />;

            case GAME_VIEW.GAME_END:
              return <GameEndView />;
          }
        })()}
      </InGameFrame>
    </GameContext.Provider>
  );
};
export { Game };
