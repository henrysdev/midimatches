import React, { useState } from "react";

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
  const [soundIsOn, setSoundIsOn] = useState<boolean>(Tone.Master.mute);

  const toggleMute = () => {
    const newIsSoundOn = !soundIsOn;
    Tone.Master.mute = newIsSoundOn;
    setSoundIsOn(newIsSoundOn);
  };

  return (
    <div className="in_game_settings_pane inline_screen">
      <h5 style={{ textAlign: "left", color: "#999" }}>MIDI Inputs</h5>
      <MidiConfiguration
        originalMidiInputs={originalMidiInputs}
        setMidiInputs={setMidiInputs}
        disabledMidiInputIds={disabledMidiInputIds}
        setDisabledMidiInputIds={setDisabledMidiInputIds}
      />
      <h5 style={{ textAlign: "left", color: "#999" }}>Sound</h5>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        <li style={{ padding: 0 }}>
          {soundIsOn ? (
            <i style={{ verticalAlign: "middle" }} className="material-icons">
              volume_off
            </i>
          ) : (
            <i style={{ verticalAlign: "middle" }} className="material-icons">
              volume_up
            </i>
          )}
          <label className="switch">
            <input
              type="checkbox"
              checked={!soundIsOn}
              onChange={() => toggleMute()}
            />
            <span className="slider round"></span>
          </label>
        </li>
      </ul>
    </div>
  );
};
export { GameSettings };
