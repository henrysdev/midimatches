import React, { useState } from "react";

import { GameLayout } from "../pages/room/game";
import { GameContext, ToneAudioContext, PlayerContext } from "../../contexts";
import { Instructions, Title, DynamicContent } from "../common";
import { Keyboard } from "../audio";
import { GameStartView } from "../pages/room/game/views";
import { useWebMidi } from "../../hooks";

interface PregameDebugProps {}

const desc = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id pharetra urna. 
Curabitur efficitur non urna nec consequat. Nam volutpat, ex et bibendum egestas, 
massa mi pharetra ante, sagittis efficitur libero purus vel leo. Integer elementum 
sagittis dolor rhoncus bibendum. Duis pharetra mi sed nibh pretium semper. Morbi in 
tincidunt tellus. Mauris et dolor placerat, venenatis ex in, semper risus. Mauris 
gravida tincidunt est, vel bibendum libero pulvinar vel. Vivamus tristique aliquet 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id pharetra urna. 
Curabitur efficitur non urna nec consequat. Nam volutpat, ex et bibendum egestas, 
massa mi pharetra ante, sagittis efficitur libero purus vel leo. Integer elementum 
sagittis dolor rhoncus bibendum. Duis pharetra mi sed nibh pretium semper. Morbi in 
tincidunt tellus. Mauris et dolor placerat, venenatis ex in, semper risus. Mauris 
gravida tincidunt est, vel bibendum libero pulvinar vel. Vivamus tristique aliquet 
`;

const PregameDebug: React.FC<PregameDebugProps> = ({}) => {
  const [midiInputs] = useWebMidi();
  return (
    <div>
      <GameContext.Provider
        value={{
          readyUps: [],
          players: [
            { playerAlias: "xb4z", musicianId: "1199" },
            { playerAlias: "fearz123", musicianId: "1111" },
          ],
          scores: {
            fearz123: 0,
            xb4z: 2,
          },
        }}
      >
        <PlayerContext.Provider
          value={{ player: { playerAlias: "xb4z", musicianId: "1199" } }}
        >
          <ToneAudioContext.Provider value={{ midiInputs }}>
            <GameLayout>
              <GameStartView
                pushMessageToChannel={() => {}}
                setMidiInputs={() => {}}
              />
            </GameLayout>
            {/* <GameLayout>
          <Title title="Starting Game" />
          <DynamicContent>
            <div>
              <Keyboard
                activeMidiList={[]}
                playNote={() => {}}
                stopNote={() => {}}
              />
            </div>
          </DynamicContent>
          <Instructions title="asdf" description={desc}></Instructions>
        </GameLayout> */}
          </ToneAudioContext.Provider>
        </PlayerContext.Provider>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
