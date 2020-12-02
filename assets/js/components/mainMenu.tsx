import React from "react";
import MenuButton from "./menuButton";

const MainMenu: React.FC = () => {
  return (
    <ul>
      <li>
        <MenuButton label={"Find Match"} disabled={false} callback={() => console.log("a!")} />
      </li>
      <li>
        <MenuButton label={"Practice"} disabled={false} callback={() => console.log("b!")} />
      </li>
      <li>
        <MenuButton label={"Help/Settings"} disabled={false} callback={() => console.log("c!")} />
      </li>
    </ul>
  );
};
export default MainMenu;