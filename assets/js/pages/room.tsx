import React from "react";
import { MidiRecorder } from '../components/room/MidiRecorder';

const RoomPage: React.FC = () => {
  const roomStartTime = Date.now();
  const timestepSize = 10;
  const quantizationThreshold = 0.2;
  return (
    <div>
      <MidiRecorder
        roomStartTime={roomStartTime}
        timestepSize={timestepSize}
        quantizationThreshold={quantizationThreshold}
      />
    </div>
  );
};
export { RoomPage };