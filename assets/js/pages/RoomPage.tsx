import React from "react";
// import { MidiRecorder } from '../components/room/MidiRecorder';
import { Game } from '../components/room/Game';

const RoomPage: React.FC = () => {
  const roomStartTime = Date.now();
  const timestepSize = 100;
  const quantizationThreshold = 0.2;
  return (
    <div>
      <Game />
      {/* <MidiRecorder
        roomStartTime={roomStartTime}
        timestepSize={timestepSize}
        quantizationThreshold={quantizationThreshold}
      /> */}
    </div>
  );
};
export { RoomPage };