import * as React from "react";
import { MidiMatchesLogoSvg } from "./MidiMatchesLogoSvg";

interface HeaderNavProps {
  playerAlias?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ playerAlias }) => {
  return (
    <div className="header_nav sticky">
      <div className="navbar_actions_group roboto_font">
        <a href="/menu" className="navbar_action">
          <i className="material-icons navbar_icon">menu</i>
        </a>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
        <div className="relative_anchor">
          <a href="/menu" className="nav_header_logo centered_div">
            <MidiMatchesLogoSvg />
          </a>
        </div>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
        {!!playerAlias ? (
          <p className="current_player_badge">
            playing as <strong>{playerAlias}</strong>
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export { HeaderNav };
