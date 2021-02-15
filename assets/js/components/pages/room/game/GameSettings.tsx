import React, { useState } from "react";

import { useToneAudioContext } from "../../../../hooks";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const { Tone } = useToneAudioContext();
  const [soundIsOn, setSoundIsOn] = useState<boolean>(Tone.Master.mute);

  const toggleMute = () => {
    const newIsSoundOn = !soundIsOn;
    Tone.Master.mute = newIsSoundOn;
    setSoundIsOn(newIsSoundOn);
  };

  return (
    <div
      style={{
        minHeight: "200px",
        flexGrow: 1,
      }}
    >
      <h5 style={{ textAlign: "left", color: "#999" }}>Settings</h5>
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
