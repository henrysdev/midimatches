import React, { useEffect, useState, useMemo } from "react";

import {
  ToneAudioContext,
  GameContext,
  GameRulesContext,
  KeyboardInputContext,
} from "../../../contexts";
import {
  useAudioContextProvider,
  useLoadRandomSamples,
  useCurrentUserContext,
  useSocketContext,
} from "../../../hooks";
import {
  msToMicros,
  randomElement,
  currUtcTimestamp,
  mod,
} from "../../../utils";
import { InGameFrame, GameSettings, GameSubContexts } from "../room/game";
import { WarmUp } from "../room/pregame";
import { PRACTICE_GAME_VIEW } from "../../../constants";
import { PracticeRecordingView } from "./views/PracticeRecordingView";
import { PracticeSampleSelectionView } from "./views/PracticeSampleSelectionView";
import { VinylLoadingSpinner, DynamicContent } from "../../common";
import { PracticePlaybackView } from "./views/PracticePlaybackView";
import { PageWrapper } from "../";

interface PracticePageProps {
  children?: any;
}
const PracticePage: React.FC<PracticePageProps> = ({ children }) => {
  const { user: currentUser } = useCurrentUserContext();
  const { socket } = useSocketContext();
  const [
    roundRecordingStartTime,
    setRoundRecordingStartTime,
  ] = useState<number>();
  const toneAudioContext = useAudioContextProvider();
  const [showKeyboardLabels, setShowKeyboardLabels] = useState<boolean>(true);
  const gameContext = useMemo(() => {
    return {
      gameRules: {
        timestepSize: 50,
        quantizationThreshold: 0.5,
      },
      ...{ roundRecordingStartTime },
    };
  }, [roundRecordingStartTime]);

  const {
    data: { samples: sampleNames = [] } = {},
    loading,
    loaded,
    loadError,
  } = useLoadRandomSamples([], 200);

  const [currentView, setCurrentView] = useState<PRACTICE_GAME_VIEW>(
    PRACTICE_GAME_VIEW.SAMPLE_SELECTION
  );

  const [currentSample, setCurrentSample] = useState<string>();
  const [currSampleIdx, setCurrSampleIdx] = useState<number>(-2);

  const incrCurrSampleIdx = () => {
    setCurrSampleIdx((prev) => prev + 1);
  };

  const decrCurrSampleIdx = () => {
    setCurrSampleIdx((prev) => prev - 1);
  };

  useEffect(() => {
    const newSample = samples[mod(currSampleIdx, samples.length)];
    toneAudioContext.loadSample(newSample);
    setCurrentSample(newSample);
  }, [currSampleIdx]);

  useEffect(() => {}, [toneAudioContext.isSamplePlayerLoaded]);

  const [currentRecording, setCurrentRecording] = useState<any>();

  const samples = useMemo(() => {
    sampleNames.sort();
    return sampleNames;
  }, [sampleNames.length]);

  useEffect(() => {
    incrCurrSampleIdx();
  }, [samples]);

  useEffect(() => {
    switch (currentView) {
      case PRACTICE_GAME_VIEW.SAMPLE_SELECTION:
        toneAudioContext.stopSample();
        break;
    }
  }, [currentView]);

  return (
    <PageWrapper socket={socket} currentUser={currentUser}>
      <ToneAudioContext.Provider value={toneAudioContext}>
        <KeyboardInputContext.Provider
          value={{
            setShowKeyboardLabels,
            showKeyboardLabels,
          }}
        >
          <GameContext.Provider value={gameContext}>
            <GameRulesContext.Provider
              value={{ gameRules: gameContext.gameRules }}
            >
              <InGameFrame title="PRACTICE">
                <div className="left_game_multi_container">
                  <div className="multi_use_items_container">
                    <div className="multi_use_item_wrapper">
                      <div className="multi_use_item selected_multi_use_item">
                        <h5 style={{ textAlign: "center" }}>Settings</h5>
                      </div>
                    </div>
                  </div>
                  <div className="left_game_content_pane">
                    <div className="left_game_content_pane_flex_anchor">
                      <div className="settings_flex_wrapper inset_3d_border_deep">
                        <GameSettings />
                      </div>
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
                  <div style={{ height: "100%" }}>
                    {(() => {
                      switch (currentView) {
                        case PRACTICE_GAME_VIEW.SAMPLE_SELECTION:
                          return (
                            <PracticeSampleSelectionView
                              nextSample={incrCurrSampleIdx}
                              prevSample={decrCurrSampleIdx}
                              currentSample={currentSample}
                              stopSample={toneAudioContext.stopSample}
                              samplePlayer={toneAudioContext.samplePlayer}
                              isSamplePlayerLoaded={
                                toneAudioContext.isSamplePlayerLoaded
                              }
                              advanceView={() => {
                                setRoundRecordingStartTime(currUtcTimestamp());
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
                            <div style={{ height: "100%" }}>
                              <PracticePlaybackView
                                isSamplePlayerLoaded={
                                  toneAudioContext.isSamplePlayerLoaded
                                }
                                sampleName={currentSample}
                                stopSample={toneAudioContext.stopSample}
                                recording={currentRecording}
                                advanceView={() => {
                                  setCurrentView(
                                    PRACTICE_GAME_VIEW.SAMPLE_SELECTION
                                  );
                                }}
                              />
                            </div>
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
        </KeyboardInputContext.Provider>
      </ToneAudioContext.Provider>
    </PageWrapper>
  );
};
export { PracticePage };
