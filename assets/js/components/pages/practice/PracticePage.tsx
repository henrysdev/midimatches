import React, { useEffect, useState, useMemo } from "react";

import {
  ToneAudioContext,
  GameContext,
  GameRulesContext,
} from "../../../contexts";
import {
  useAudioContextProvider,
  useLoadRandomSamples,
  useCurrentUserContext,
} from "../../../hooks";
import { msToMicros, randomElement } from "../../../utils";
import { InGameFrame, GameSettings, GameSubContexts } from "../room/game";
import { WarmUp } from "../room/pregame";
import { PRACTICE_GAME_VIEW } from "../../../constants";
import { PracticeRecordingView } from "./views/PracticeRecordingView";
import { PracticeSampleSelectionView } from "./views/PracticeSampleSelectionView";
import { VinylLoadingSpinner, DynamicContent } from "../../common";
import { PracticePlaybackView } from "./views/PracticePlaybackView";

interface PracticePageProps {
  children?: any;
}
const PracticePage: React.FC<PracticePageProps> = ({ children }) => {
  const [
    roundRecordingStartTime,
    setRoundRecordingStartTime,
  ] = useState<number>();
  const toneAudioContext = useAudioContextProvider();
  const gameContext = {
    gameRules: {
      timestepSize: 50,
      quantizationThreshold: 0.5,
    },
    ...{ roundRecordingStartTime },
  };

  const [currentView, setCurrentView] = useState<PRACTICE_GAME_VIEW>(
    PRACTICE_GAME_VIEW.SAMPLE_SELECTION
  );

  const [currentSample, setCurrentSample] = useState<string>();

  const [currentRecording, setCurrentRecording] = useState<any>();

  const {
    data: { samples = [] } = {},
    loading,
    loaded,
    loadError,
  } = useLoadRandomSamples([], 200);

  const pickNewSample = (samples: string[], currentSample?: string) => {
    const eligibleSamples = !!currentSample
      ? samples.filter((x) => x != currentSample)
      : samples;
    const newSample = randomElement(eligibleSamples);
    toneAudioContext.loadSample(newSample);
    setCurrentSample(newSample);
  };
  useEffect(() => {
    pickNewSample(samples, currentSample);
  }, [samples]);

  useEffect(() => {
    switch (currentView) {
      case PRACTICE_GAME_VIEW.SAMPLE_SELECTION:
        toneAudioContext.stopSample();
        break;
    }
  }, [currentView]);

  return (
    <ToneAudioContext.Provider value={toneAudioContext}>
      <GameContext.Provider value={gameContext}>
        <GameRulesContext.Provider value={{ gameRules: gameContext.gameRules }}>
          <InGameFrame title="///PRACTICE">
            <div className="left_game_content_pane">
              <div className="left_game_content_pane_flex_anchor">
                <div className="settings_flex_wrapper inset_3d_border_deep">
                  <GameSettings />
                </div>
              </div>
            </div>
            {loading ? (
              <DynamicContent>
                <div className="centered_div">
                  <VinylLoadingSpinner />
                </div>
              </DynamicContent>
            ) : loaded ? (
              <div>
                {(() => {
                  switch (currentView) {
                    case PRACTICE_GAME_VIEW.SAMPLE_SELECTION:
                      return (
                        <PracticeSampleSelectionView
                          samples={samples}
                          pickNewSample={pickNewSample}
                          currentSample={currentSample}
                          loadSample={toneAudioContext.loadSample}
                          advanceView={() => {
                            setRoundRecordingStartTime(msToMicros(Date.now()));
                            setCurrentView(PRACTICE_GAME_VIEW.RECORDING);
                          }}
                        />
                      );

                    case PRACTICE_GAME_VIEW.RECORDING:
                      return !!currentSample ? (
                        <PracticeRecordingView
                          setRecordingCallback={setCurrentRecording}
                          sampleName={currentSample}
                          stopSample={toneAudioContext.stopSample}
                          advanceView={() => {
                            setCurrentView(PRACTICE_GAME_VIEW.PLAYBACK);
                          }}
                        />
                      ) : (
                        <></>
                      );

                    case PRACTICE_GAME_VIEW.PLAYBACK:
                      return !!currentSample ? (
                        <PracticePlaybackView
                          isSamplePlayerLoaded={
                            toneAudioContext.isSamplePlayerLoaded
                          }
                          sampleName={currentSample}
                          stopSample={toneAudioContext.stopSample}
                          recording={currentRecording}
                          advanceView={() => {
                            setCurrentView(PRACTICE_GAME_VIEW.SAMPLE_SELECTION);
                          }}
                        />
                      ) : (
                        <></>
                      );
                  }
                })()}
              </div>
            ) : (
              <></>
            )}
          </InGameFrame>
        </GameRulesContext.Provider>
      </GameContext.Provider>
    </ToneAudioContext.Provider>
  );
};
export { PracticePage };
