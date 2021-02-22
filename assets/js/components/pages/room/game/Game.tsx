import { Channel } from "phoenix";
import React, { useEffect, useState, useMemo } from "react";

import * as Tone from "tone";
import { GAME_VIEW, DEFAULT_SYNTH_CONFIG } from "../../../../constants";
import { GameContext, ToneAudioContext } from "../../../../contexts";
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
import { GameLayout, InGameFrame } from ".";
import { Input } from "webmidi";
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
  const [midiInputs, setMidiInputs] = useState<Array<Input>>([]);
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);
  const { player: currPlayer } = usePlayerContext();
  const [synth, setSynth] = useState<any>();

  const currSampleBeat = useMemo(() => {
    return gameContext.sampleBeats[gameContext.roundNum - 1];
  }, [gameContext.roundNum]);

  const resetTone = () => {
    stopSample();
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
  };

  useEffect(() => {
    Tone.context.lookAhead = 0;
    const newSynth = new Tone.PolySynth(DEFAULT_SYNTH_CONFIG).toDestination();
    // const newSynth = new Tone.Sampler({
    //   urls: {
    //     C4: "funk_daddy_c4.mp3",
    //     C5: "funk_daddy_c5.mp3",
    //   },
    //   baseUrl: "https://progressions-game.s3.amazonaws.com/synths/funk_daddy/",
    // }).toDestination();
    setSynth(newSynth);
  }, []);

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        loadSample(currSampleBeat);
        break;
      case GAME_VIEW.RECORDING:
        loadSample(currSampleBeat);
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        loadSample(currSampleBeat);
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
      <ToneAudioContext.Provider value={{ Tone, midiInputs, synth }}>
        <InGameFrame>
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
                return (
                  <RoundStartView
                    pushMessageToChannel={pushMessage}
                    roundNum={gameContext.roundNum}
                  />
                );

              case GAME_VIEW.RECORDING:
                return (
                  <RecordingView
                    isContestant={
                      !!gameContext.players
                        ? gameContext.players
                            .map(({ playerId }) => playerId)
                            .includes(currPlayer.playerId)
                        : false
                    }
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
      </ToneAudioContext.Provider>
    </GameContext.Provider>
  );
};
export { Game };
