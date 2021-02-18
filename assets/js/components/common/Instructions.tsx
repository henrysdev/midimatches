import React from "react";

interface InstructionsProps {
  title?: string;
  description?: string;
  children?: any;
}
const Instructions: React.FC<InstructionsProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="instructions_card">
      {!!title ? <div>{title}</div> : <></>}
      <div>
        {!!description ? <p>{description}</p> : <></>}
        {children}
      </div>
    </div>
  );
};
export { Instructions };
