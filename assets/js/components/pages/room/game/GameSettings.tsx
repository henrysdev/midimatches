import React, { useState, useEffect, useMemo } from "react";

import { useToneAudioContext, useCookies } from "../../../../hooks";
import { MidiConfiguration } from "../../../audio";
import {
  MIN_SOUND_VOLUME,
  MAX_SOUND_VOLUME,
  SOUND_VOLUME_COOKIE,
} from "../../../../constants";
import Cookies from "universal-cookie";
import { MaterialIcon } from "../../../common";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const {
    Tone,
    setMidiInputs,
    disabledMidiInputIds,
    setDisabledMidiInputIds,
    originalMidiInputs,
  } = useToneAudioContext();

  const { hasCookie, getCookie, setCookie } = useCookies();
  const [currVolume, setCurrVolume] = useState<string>("-1");
  const handleVolumeChange = (e: any) => {
    const volume = e.target.value;
    setCurrVolume(volume);
  };

  useEffect(() => {
    if (hasCookie(SOUND_VOLUME_COOKIE)) {
      setCurrVolume(getCookie(SOUND_VOLUME_COOKIE));
    }
  }, []);

  useEffect(() => {
    const volume = parseFloat(currVolume);
    Tone.Master.volume.value = volume;
    Tone.Master.mute = volume === MIN_SOUND_VOLUME;
    setCookie(SOUND_VOLUME_COOKIE, currVolume);
  }, [currVolume]);

  const soundIsOn = useMemo(() => {
    return currVolume === `${MIN_SOUND_VOLUME}`;
  }, [currVolume]);

  return (
    <div className="in_game_settings_pane inline_screen">
      <h5 className="settings_item_label">MIDI Inputs</h5>
      <MidiConfiguration
        originalMidiInputs={originalMidiInputs}
        setMidiInputs={setMidiInputs}
        disabledMidiInputIds={disabledMidiInputIds}
        setDisabledMidiInputIds={setDisabledMidiInputIds}
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
    </div>
  );
};
export { GameSettings };
