import React, { useState } from "react";

import { useToneAudioContext } from "../../../../hooks";

interface GameSettingsProps {}

const GameSettings: React.FC<GameSettingsProps> = ({}) => {
  const { Tone } = useToneAudioContext();
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const toggleMute = () => {
    const newIsMuted = !isMuted;
    Tone.Master.mute = newIsMuted;
    setIsMuted(newIsMuted);
  };

  return (
    <div className="settings_box">
      <button
        className="uk-button uk-button-default"
        onClick={() => toggleMute()}
      >
        toggle mute
      </button>
    </div>
  );
};
export { GameSettings };
