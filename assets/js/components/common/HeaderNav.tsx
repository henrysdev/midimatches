import * as React from "react";

interface HeaderNavProps {
  playerAlias?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ playerAlias }) => (
  <div
    style={{
      display: "flex",
      padding: "8px",
      paddingTop: "0px",
    }}
  >
    <div
      style={{
        flex: "1",
      }}
    >
      <a href="/">
        <h5 style={{ fontFamily: "Audiowide, cursive", cursor: "pointer" }}>
          ///MIDI MATCHES
        </h5>
      </a>
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

export { HeaderNav };
