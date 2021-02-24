import * as React from "react";

interface HeaderNavProps {
  playerAlias?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ playerAlias }) => {
  return (
    <div className="header_nav sticky">
      <div className="navbar_actions_group roboto_font">
        <a href="/" className="navbar_action">
          <i className="material-icons navbar_icon">home</i>
        </a>
        <a href="/register" className="navbar_action">
          <i className="material-icons navbar_icon">account_box</i>
        </a>
        <a href="/servers" className="navbar_action">
          <i className="material-icons navbar_icon">videogame_asset</i>
        </a>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
        <div className="relative_anchor">
          <a href="/" className="nav_header_logo centered_div">
            <svg style={{ marginTop: "6px" }} viewBox="0 0 100 8" width="200px">
              <text x="0" y="8" className="logo_keys">
                ///
              </text>
              <text x="17" y="8" className="logo_text">
                MIDIMATCHES
              </text>
            </svg>
          </a>
        </div>
      </div>
      <div
        style={{
          flex: "1",
        }}
      >
        {!!playerAlias ? (
          <p
            style={{
              float: "right",
              padding: "4px",
              backgroundColor: "#ccdcff",
              borderRadius: "3px",
            }}
          >
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
