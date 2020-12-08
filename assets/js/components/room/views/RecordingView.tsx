import React from "react";
import { SimpleButton } from '../../common/index';
import { MidiInput } from '../../midi/index';
import { Channel } from "phoenix";

interface RecordingViewProps {
  nextViewCallback: Function;
  channel: Channel;
}

const RecordingView: React.FC<RecordingViewProps> = ({nextViewCallback, channel}) => {
  return (
    <>
    <div>
      CANVAS FOR NOTES BEING PLAYED MOVING LEFT  
    </div>
    <MidiInput />
    <h1>Sample Recording View</h1>
    <SimpleButton label="next state" callback={() => nextViewCallback()}  disabled={false} />
    </>
  );
};
export { RecordingView };