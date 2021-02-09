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
        <Button
          label="Lets Play!"
          callback={() => {
            window.location.href = "/servers";
          }}
        />
      </div>
    </div>
  );
};
export { LandingPage };
