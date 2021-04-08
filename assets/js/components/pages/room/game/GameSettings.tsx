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
    </div>
  );
};
export { GameSettings };
