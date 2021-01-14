import { Channel } from "phoenix";
import React, { useContext, useEffect, useState } from "react";

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
import { useSamplePlayer, useToneAudioContext } from "../../../../hooks";

interface GameProps {
  gameChannel: Channel;
  musicianId: string;
}

const Game: React.FC<GameProps> = ({ gameChannel, musicianId }) => {
  const [currentView, setCurrentView] = useState(GAME_VIEW.GAME_START);
  const [gameContext, setGameContext] = useState({} as GameContextType);
  const { Tone } = useToneAudioContext();
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);

  useEffect(() => {
    gameChannel.on(VIEW_UPDATE_EVENT, (body) => {
      console.log("FIRES!!");
      const { gameState } = unmarshalBody(body) as ViewUpdatePayload;
      const gameView = gameViewAtomToEnum(gameState.gameView);
      setGameContext(gameState);
      setCurrentView(gameView);
    });
  }, []);

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

  const genericPushMessage = (event: string, payload: Object) => {
    if (!!gameChannel) {
      gameChannel.push(event, payload);
    }
  };

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      {(() => {
        switch (currentView) {
          case GAME_VIEW.GAME_START:
            return <GameStartView pushMessageToChannel={genericPushMessage} />;

          case GAME_VIEW.ROUND_START:
            return <RoundStartView pushMessageToChannel={genericPushMessage} />;

          case GAME_VIEW.RECORDING:
            return (
              <RecordingView
                isContestant={
                  !!gameContext.contestants
                    ? gameContext.contestants.includes(musicianId)
                    : false
                }
                pushMessageToChannel={genericPushMessage}
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
                pushMessageToChannel={genericPushMessage}
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
