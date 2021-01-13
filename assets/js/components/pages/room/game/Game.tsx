import { Channel } from "phoenix";
import React, { useEffect, useState } from "react";

import * as Tone from "tone";
import { GAME_VIEW, VIEW_UPDATE_EVENT } from "../../../../constants";
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

interface GameProps {
  gameChannel: Channel;
  musicianId: string;
}

const Game: React.FC<GameProps> = ({ gameChannel, musicianId }) => {
  // game state
  const [currentView, setCurrentView] = useState(GAME_VIEW.GAME_START);
  const [gameContext, setGameContext] = useState<GameContextType>(
    {} as GameContextType
  );
  const [samplePlayer, setSamplePlayer] = useState<SamplePlayer>();

  useEffect(() => {
    gameChannel.on(VIEW_UPDATE_EVENT, (body) => {
      const { gameState } = unmarshalBody(body) as ViewUpdatePayload;
      const gameView = gameViewAtomToEnum(gameState.gameView);
      setCurrentView(gameView);
      setGameContext(gameState);
      setSamplePlayer(
        new Tone.Player("/sounds/ragga_sample.mp3").toDestination()
      );
    });
  }, []);

  // stop and reset sample player on any view change
  useEffect(() => {
    if (!!samplePlayer) {
      if (currentView !== GAME_VIEW.RECORDING) {
        samplePlayer.stop();
      }
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
                samplePlayer={samplePlayer}
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
                samplePlayer={samplePlayer}
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
