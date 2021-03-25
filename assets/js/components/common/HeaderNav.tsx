import * as React from "react";
import { MidiMatchesLogoSvg } from "./MidiMatchesLogoSvg";
import { MaterialIcon } from ".";
import { useBrowserCompatibilityContext } from "../../hooks";

interface HeaderNavProps {
  playerAlias?: string;
  browserWarning?: boolean;
}

const HeaderNav: React.FC<HeaderNavProps> = ({
  playerAlias,
  browserWarning,
}) => {
  const { setShowCompatibilityWarning } = useBrowserCompatibilityContext();
  return (
    <div className="header_nav sticky">
      <div className="navbar_actions_group roboto_font">
        <a href="/menu" className="navbar_action resource_link audiowide_font">
          <MaterialIcon iconName="menu" className="navbar_icon" />
          MENU
        </a>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
        <div className="relative_anchor">
          <a href="/about" className="nav_header_logo centered_div">
            <MidiMatchesLogoSvg />
          </a>
        </div>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
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
          {browserWarning ? (
            <div onClick={() => setShowCompatibilityWarning(true)}>
              <p className="browser_warning_navbar_badge">
                ⚠ Unsupported Browser
              </p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export { HeaderNav };
