import React from "react";

const VinylLoadingSpinner: React.FC = () => {
  return (
    <div style={{ transform: "scale(0.4" }}>
      <div className="vynil vynil__round">
        <div className="shade">
          <div className="vynil vynil__border vynil__border-1"></div>
          <div className="vynil vynil__border vynil__border-2"></div>
          <div className="vynil vynil__border vynil__border-3"></div>
          <div className="vynil label label__content spin roboto_font">
            L_ADING
          </div>
          <div className="vynil hole"></div>
        </div>
      </div>
      <br />
    </div>
  );
};
export { VinylLoadingSpinner };
