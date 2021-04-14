import React, { useState, useEffect, useMemo } from "react";

import {
  useToneAudioContext,
  useCookies,
  useKeyboardInputContext,
} from "../../../../hooks";
import { MidiConfiguration } from "../../../audio";
import {
  MIN_SOUND_VOLUME,
  MAX_SOUND_VOLUME,
  SOUND_VOLUME_COOKIE,
  SHOW_KEYBOARD_LABELS_COOKIE,
  MAX_INPUT_LAG_COMP,
  DEFAULT_INPUT_LAG_COMPENSATION,
} from "../../../../constants";
import { MaterialIcon } from "../../../common";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const {
    setMidiInputs,
    disabledMidiInputIds,
    setDisabledMidiInputIds,
    originalMidiInputs,
    currVolume,
    setCurrVolume,
    soundIsOn,
    refreshMidiInputs,
    currInputLagComp,
    setCurrInputLagComp,
    shouldQuantize,
    setShouldQuantize,
  } = useToneAudioContext();

  const {
    showKeyboardLabels,
    setShowKeyboardLabels,
  } = useKeyboardInputContext();

  const handleVolumeChange = (e: any) => {
    const volume = e.target.value;
    setCurrVolume(volume);
  };

  const handleShowKeyboardLabelsChange = (e: any) => {
    setShowKeyboardLabels(!showKeyboardLabels);
  };

  return (
    <div className="in_game_settings_pane inline_screen">
      <div style={{ display: "flex" }}>
        <div style={{ flex: 2 }}>
          <h5 className="settings_item_label">MIDI Inputs</h5>
        </div>
        <div
          className="styled_button refresh_button"
          style={{ flex: 1, float: "right" }}
          onClick={() => refreshMidiInputs()}
        >
          refresh
        </div>
      </div>
      <MidiConfiguration
        originalMidiInputs={originalMidiInputs}
        setMidiInputs={setMidiInputs}
        disabledMidiInputIds={disabledMidiInputIds}
        setDisabledMidiInputIds={setDisabledMidiInputIds}
        refreshMidiInputs={refreshMidiInputs}
      />
      <h5 className="settings_item_label">Volume</h5>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        <li style={{ padding: 0 }}>
          <div className="volume_slider_container">
            {soundIsOn ? (
              <MaterialIcon iconName="volume_off" style={{ color: "red" }} />
            ) : (
              <MaterialIcon iconName="volume_up" />
            )}
            <input
              type="range"
              min={`${MIN_SOUND_VOLUME}`}
              max={`${MAX_SOUND_VOLUME}`}
              value={currVolume}
              onChange={handleVolumeChange}
              className="volume_slider"
            />
          </div>
        </li>
      </ul>
      <h5 className="settings_item_label">Type-to-Play Hints</h5>
      <label className="switch">
        <input
          type="checkbox"
          checked={showKeyboardLabels}
          onChange={handleShowKeyboardLabelsChange}
        />
        <span className="slider round"></span>
      </label>
      <h5 className="settings_item_label">Quantize Notes</h5>
      <label className="switch">
        <input
          type="checkbox"
          checked={shouldQuantize}
          onChange={() => setShouldQuantize(!shouldQuantize)}
        />
        <span className="slider round"></span>
      </label>
      {/* <h5 className="settings_item_label">Input Lag Comp (ms)</h5>
      <div className="input_lag_comp">
        <input
          type="number"
          min={0}
          max={MAX_INPUT_LAG_COMP}
          value={currInputLagComp}
          onChange={handleInputLagCompChange}
          className="input_lag_comp_input"
        />
      </div> */}
    </div>
  );
};
export { GameSettings };
