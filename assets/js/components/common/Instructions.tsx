import React from "react";

interface InstructionsProps {
  title?: string;
  description?: string;
  children?: any;
  extreme?: boolean;
}
const Instructions: React.FC<InstructionsProps> = ({
  title,
  description,
  children,
  extreme = false,
}) => {
  return (
    <div className="instructions_card">
      {!!title ? <div>{title}</div> : <></>}
      <div className="instructions_description">
        {!!description ? (
          <div>
            <p className={extreme ? "extreme_instruction" : ""}>
              {description}
            </p>
          </div>
        ) : (
          <></>
        )}
        {children}
      </div>
    </div>
  );
};
export { Instructions };
