import React from "react";

interface AlertModalProps {
  messageText: string;
}
const AlertModal: React.FC<AlertModalProps> = ({ messageText }) => {
  return (
    <div className="alert_modal">
      <div className="alert_modal_content">
        <p>{messageText}</p>
      </div>
    </div>
  );
};
export { AlertModal };
