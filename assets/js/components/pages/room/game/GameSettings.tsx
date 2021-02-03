import React, { useState } from "react";

import { useToneAudioContext } from "../../../../hooks";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const { Tone } = useToneAudioContext();
  const [isMuted, setIsMuted] = useState<boolean>(Tone.Master.mute);

  const toggleMute = () => {
    const newIsMuted = !isMuted;
    Tone.Master.mute = newIsMuted;
    setIsMuted(newIsMuted);
  };

  return (
    <div
      style={{
        height: "200px",
        padding: "8px",
        flexGrow: 1,
      }}
    >
      <ul className="uk-iconnav uk-iconnav-vertical">
        <li>
          <i style={{ verticalAlign: "middle" }} className="material-icons">
            volume_off
          </i>
          <label className="switch">
            <input
              type="checkbox"
              checked={isMuted}
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
