import React from "react";

interface InstructionsProps {
  title?: string;
  description: string;
  children?: any;
}
const Instructions: React.FC<InstructionsProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div
      style={{
        maxHeight: "300px",
        overflow: "scroll",
        overflowY: "auto",
        overflowX: "auto",
        padding: "8px",
        boxShadow: "0 3px 10px rgb(0 0 0 / 8%)",
        color: "#666",
      }}
    >
      {!!title ? <div>{title}</div> : <></>}
      <div>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
};
export { Instructions };
