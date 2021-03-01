import React, { useEffect, useState, useMemo } from "react";

import { ToneAudioContext } from "../../../contexts";
import { useAudioContextProvider, useLoadRandomSamples } from "../../../hooks";

import { InGameFrame, GameSettings } from "../room/game";
import { WarmUp } from "../room/pregame";
import { PRACTICE_GAME_VIEW } from "../../../constants";
import { PracticeRecordingView } from "./views/PracticeRecordingView";
import { PracticeSampleSelectionView } from "./views/PracticeSampleSelectionView";
import { LoadingSpinner, DynamicContent } from "../../common";

interface PracticePageProps {
  children?: any;
}
const PracticePage: React.FC<PracticePageProps> = ({ children }) => {
  const toneAudioContext = useAudioContextProvider();

  const [currentView, setCurrentView] = useState<PRACTICE_GAME_VIEW>(
    PRACTICE_GAME_VIEW.SAMPLE_SELECTION
  );

  const [currentSample, setCurrentSample] = useState<string>();

  const {
    data: { samples = [] } = {},
    loading,
    loaded,
    loadError,
  } = useLoadRandomSamples([], 200);

  return (
    <ToneAudioContext.Provider value={toneAudioContext}>
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
              <LoadingSpinner />
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
                      setCurrentSample={setCurrentSample}
                      currentSample={currentSample}
                      loadSample={toneAudioContext.loadSample}
                      advanceView={() => {
                        setCurrentView(PRACTICE_GAME_VIEW.RECORDING);
                      }}
                    />
                  );

                case PRACTICE_GAME_VIEW.RECORDING:
                  return <div>Practice Recording View</div>;

                case PRACTICE_GAME_VIEW.PLAYBACK:
                  return <div>Practice Playback View</div>;
              }
            })()}
          </div>
        ) : (
          <></>
        )}
      </InGameFrame>
    </ToneAudioContext.Provider>
  );
};
export { PracticePage };
