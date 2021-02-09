import React from "react";

import { HowToPlay } from ".";
import { Button } from "../../common";

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "auto",
        marginTop: "16px",
        padding: "24px",
        boxShadow: "0 5px 15px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      <div>
        <h1 className="uk-text-center">Progressions</h1>
        <HowToPlay />
        <button
          style={{ width: "100%", marginTop: "16px" }}
          className="uk-button uk-button-primary"
          onClick={() => (window.location.href = "/servers")}
        >
          READY TO PLAY!
        </button>
      </div>
    </div>
  );
};
export { LandingPage };
