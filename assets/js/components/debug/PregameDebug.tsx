import React, { useState } from "react";

import { GameLayout } from "../pages/room/game";
import { GameContext } from "../../contexts";
import { Instructions } from "../common";

interface PregameDebugProps {}

const desc = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id pharetra urna. 
Curabitur efficitur non urna nec consequat. Nam volutpat, ex et bibendum egestas, 
massa mi pharetra ante, sagittis efficitur libero purus vel leo. Integer elementum 
sagittis dolor rhoncus bibendum. Duis pharetra mi sed nibh pretium semper. Morbi in 
tincidunt tellus. Mauris et dolor placerat, venenatis ex in, semper risus. Mauris 
gravida tincidunt est, vel bibendum libero pulvinar vel. Vivamus tristique aliquet 
nibh sit amet consequat. Ut ultrices tempor eros non ultrices. Duis venenatis, mi sit 
amet dignissim sollicitudin, eros massa dignissim quam, nec condimentum nunc leo sed 
leo. Curabitur tincidunt bibendum sodales. Morbi dictum tempus nisi, sit amet tincidunt 
diam interdum ut.
`;

const PregameDebug: React.FC<PregameDebugProps> = ({}) => {
  return (
    <div>
      <GameContext.Provider
        value={{
          musicians: ["xb4z", "fear this team", "__kai__", "favtowin"],
        }}
      >
        <GameLayout>
          <Instructions title={"Game Start"} description={desc}>
            <div style={{ border: "1px solid black" }}>ajlaksd</div>
          </Instructions>
        </GameLayout>
      </GameContext.Provider>
    </div>
  );
};
export { PregameDebug };
