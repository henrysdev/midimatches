import React from "react";

import { HowToPlay } from "./components/pages/landing";

const MobilePlaceholder: React.FC = () => {
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
        <div>
          <strong>Note: </strong>Progressions is not currently supported on
          mobile.
        </div>
        <HowToPlay />
      </div>
    </div>
  );
};
export { MobilePlaceholder };
