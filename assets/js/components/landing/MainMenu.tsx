import React from "react";
import { SimpleButton } from "../common/index";

const MainMenu: React.FC = () => {
  return (
    <ul>
      <li>
        <SimpleButton
          label={"Find Match"}
          disabled={false}
          callback={() => console.log("a!")}
        />
      </li>
      <li>
        <SimpleButton
          label={"Practice"}
          disabled={false}
          callback={() => console.log("b!")}
        />
      </li>
      <li>
        <SimpleButton
          label={"Help/Settings"}
          disabled={false}
          callback={() => console.log("c!")}
        />
      </li>
    </ul>
  );
};
export { MainMenu };
