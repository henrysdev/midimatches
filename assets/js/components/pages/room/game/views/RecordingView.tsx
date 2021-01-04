import React, { useContext, useState } from "react";
import { SimpleButton } from "../../../../common/index";
import { MidiInput } from "../../../../audio/index";
import { SUBMIT_RECORDING_EVENT } from "../../../../../constants/index";
import { GameContext } from "../../../../../contexts/index";

interface RecordingViewProps {
  pushMessageToChannel: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  pushMessageToChannel,
}) => {
  const [playerRecording, setPlayerRecording] = useState<Object>();

  return (
    <div>
      <h3>Recording View</h3>
      <MidiInput submitRecording={setPlayerRecording} />
      <h1>Sample Recording View</h1>
      <SimpleButton
        label="Submit Recording"
        callback={() => {
          if (!!playerRecording) {
            pushMessageToChannel(SUBMIT_RECORDING_EVENT, {
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
