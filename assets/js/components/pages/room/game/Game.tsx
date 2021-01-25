import { Channel } from "phoenix";
import React, { useEffect, useState } from "react";

import {
  GAME_VIEW,
  VIEW_UPDATE_EVENT,
  SAMPLE_URLS,
} from "../../../../constants";
import { GameContext } from "../../../../contexts";
import {
  GameContextType,
  ViewUpdatePayload,
  SamplePlayer,
} from "../../../../types";
import { gameViewAtomToEnum, unmarshalBody } from "../../../../utils";
import { ClientDebug } from "../../../debug";
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
  useToneAudioContext,
} from "../../../../hooks";

interface GameProps {
  gameChannel: Channel;
  musicianId: string;
}

const Game: React.FC<GameProps> = ({ gameChannel, musicianId }) => {
  const [currentView, gameContext, pushMessage] = useGameServerState(
    gameChannel
  );
  const { Tone } = useToneAudioContext();
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);

  useEffect(() => {
    if (currentView === GAME_VIEW.ROUND_START) {
      // TODO random choice [?]
      loadSample(SAMPLE_URLS[0]);
    }
    // TODO remove once recording timer is properly handled
    if (currentView !== GAME_VIEW.RECORDING) {
      // TODO replace with call to function that holistically resets Tone Transport and related stuff.
      stopSample();
    }
  }, [currentView]);

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.GAME_START:
            return <GameStartView pushMessageToChannel={pushMessage} />;

          case GAME_VIEW.ROUND_START:
            return <RoundStartView pushMessageToChannel={pushMessage} />;

          case GAME_VIEW.RECORDING:
            return (
              <RecordingView
                isContestant={
                  !!gameContext.contestants
                    ? gameContext.contestants.includes(musicianId)
                    : false
                }
                pushMessageToChannel={pushMessage}
                playSample={playSample}
              />
            );

          case GAME_VIEW.PLAYBACK_VOTING:
            return (
              <PlaybackVotingView
                isJudge={
                  !!gameContext.judges
                    ? gameContext.judges.includes(musicianId)
                    : false
                }
                pushMessageToChannel={pushMessage}
                contestants={
                  !!gameContext.contestants ? gameContext.contestants : []
                }
                playSample={playSample}
              />
            );

          case GAME_VIEW.ROUND_END:
            return <RoundEndView />;

          case GAME_VIEW.GAME_END:
            return <GameEndView />;
        }
      })()}
      <ClientDebug musicianId={musicianId} />
    </GameContext.Provider>
  );
};
export { Game };
