import * as React from "react";

interface HeaderNavProps {
  playerAlias?: string;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ playerAlias }) => (
  <div
    style={{
      display: "flex",
      height: "32px",
    }}
  >
    <div
      style={{
        flex: "1",
      }}
    >
      <h5 style={{ fontFamily: "Audiowide, cursive" }}>Progressions</h5>
    </div>
    <div
      style={{
        flex: "1",
      }}
    >
      <p style={{ float: "right" }}>
        playing as <strong>{!!playerAlias ? playerAlias : "anonymous"}</strong>
      </p>
    </div>
  </div>
);

export { HeaderNav };
