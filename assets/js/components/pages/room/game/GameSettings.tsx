import React, { useState, useEffect, useMemo } from "react";

import { useToneAudioContext } from "../../../../hooks";
import { MidiConfiguration } from "../../../audio";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const {
    Tone,
    midiInputs,
    setMidiInputs,
    disabledMidiInputIds,
    setDisabledMidiInputIds,
    originalMidiInputs,
  } = useToneAudioContext();
  const [currVolume, setCurrVolume] = useState<string>("-1");
  const handleVolumeChange = (e: any) => {
    const volume = e.target.value;
    setCurrVolume(volume);
  };

  useEffect(() => {
    const volume = parseFloat(currVolume);
    Tone.Master.volume.value = volume / 10.0;
    Tone.Master.mute = volume === -100;
  }, [currVolume]);

  const soundIsOn = useMemo(() => {
    return currVolume === "-100";
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
              <i
                style={{ verticalAlign: "middle", color: "red" }}
                className="material-icons"
              >
                volume_off
              </i>
            ) : (
              <i style={{ verticalAlign: "middle" }} className="material-icons">
                volume_up
              </i>
            )}
            <input
              type="range"
              min="-100"
              max="10"
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
