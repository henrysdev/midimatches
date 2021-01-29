import { Channel } from "phoenix";
import React, { useEffect, useState } from "react";

import * as Tone from "tone";
import { GAME_VIEW, SAMPLE_URLS } from "../../../../constants";
import { GameContext, ToneAudioContext } from "../../../../contexts";
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
  usePlayerContext,
} from "../../../../hooks";
import { GameLayout } from "./GameLayout";
import { Input } from "webmidi";

interface GameProps {
  gameChannel: Channel;
}

const Game: React.FC<GameProps> = ({ gameChannel }) => {
  const [currentView, gameContext, pushMessage] = useGameServerState(
    gameChannel
  );
  const [midiInputs, setMidiInputs] = useState<Array<Input>>([]);
  console.log("GAME CONTEXT ", gameContext);
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);
  const { player: currPlayer } = usePlayerContext();

  const resetTone = () => {
    stopSample();
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
  };

  useEffect(() => {
    Tone.context.lookAhead = 0.01;
  }, []);

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        // TODO random choice [?]
        loadSample(SAMPLE_URLS[0]);
        break;
      case GAME_VIEW.RECORDING:
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        resetTone();
        break;
      case GAME_VIEW.ROUND_END:
        resetTone();
        break;
      case GAME_VIEW.GAME_END:
        resetTone();
        break;
    }
  }, [currentView]);

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      <ToneAudioContext.Provider value={{ Tone, midiInputs }}>
        <GameLayout>
          {(() => {
            switch (currentView) {
              case GAME_VIEW.GAME_START:
                return (
                  <GameStartView
                    pushMessageToChannel={pushMessage}
                    setMidiInputs={setMidiInputs}
                  />
                );

              case GAME_VIEW.ROUND_START:
                return <RoundStartView pushMessageToChannel={pushMessage} />;

              case GAME_VIEW.RECORDING:
                return (
                  <RecordingView
                    isContestant={
                      !!gameContext.players
                        ? gameContext.players
                            .map(({ musicianId }) => musicianId)
                            .includes(currPlayer.musicianId)
                        : false
                    }
                    pushMessageToChannel={pushMessage}
                    playSample={playSample}
                  />
                );

              case GAME_VIEW.PLAYBACK_VOTING:
                return (
                  <PlaybackVotingView
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
          <ClientDebug musicianId={currPlayer.musicianId} />
        </GameLayout>
      </ToneAudioContext.Provider>
    </GameContext.Provider>
  );
};
export { Game };
