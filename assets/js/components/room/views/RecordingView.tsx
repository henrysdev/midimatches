import React, { useContext, useState } from "react";
import { SimpleButton } from "../../common/index";
import { MidiInput } from "../../midi/index";
import { SUBMIT_RECORDING_EVENT } from "../../../constants/index";
import { GameContext } from "../../../contexts/index";

interface RecordingViewProps {
  submitRecording: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({ submitRecording }) => {
  const [playerRecording, setPlayerRecording] = useState<Object>();
  const gameCtx = useContext(GameContext);

  return (
    <div>
      <h3>Recording View</h3>
      <MidiInput submitRecording={setPlayerRecording} />
      <h1>Sample Recording View</h1>
      <SimpleButton
        label="Submit Recording"
        callback={() => {
          if (!!playerRecording) {
            submitRecording(SUBMIT_RECORDING_EVENT, {
              recording: JSON.stringify(playerRecording),
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
