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
      <a href="/">
        <h5 style={{ fontFamily: "Audiowide, cursive", cursor: "pointer" }}>
          Progressions
        </h5>
      </a>
    </div>
    <div
      style={{
        flex: "1",
      }}
    >
      {!!playerAlias ? (
        <p style={{ float: "right" }}>
          playing as <strong>{playerAlias}</strong>
        </p>
      ) : (
        <></>
      )}
    </div>
  </div>
);

export { HeaderNav };
