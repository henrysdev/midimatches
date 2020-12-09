import React, { useContext, useState } from "react";
import { SimpleButton } from "../../common/index";
import { MidiInput } from "../../midi/index";
import { SUBMIT_PLAYER_RECORDING_EVENT } from "../../../constants/index";
import { GameContext } from "../../../contexts/index";

interface RecordingViewProps {
  channelPushCallback: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  channelPushCallback,
}) => {
  const [playerRecording, setPlayerRecording] = useState<Object>();
  const gameCtx = useContext(GameContext);
  console.log("RecordingView GameContext: ", gameCtx);

  return (
    <div>
      <MidiInput submitRecording={setPlayerRecording} />
      <h1>Sample Recording View</h1>
      <SimpleButton
        label="Push message to channel"
        callback={() => {
          if (!!playerRecording) {
            channelPushCallback(SUBMIT_PLAYER_RECORDING_EVENT, {
              loop: JSON.stringify(playerRecording),
            });
            setPlayerRecording(undefined);
          }
        }}
        disabled={!playerRecording}
      />
    </div>
  );
};
export { RecordingView };
