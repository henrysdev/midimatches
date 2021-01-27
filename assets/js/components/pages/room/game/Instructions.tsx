import React from "react";

interface InstructionsProps {
  title: string;
  description: string;
  children?: any;
}
const Instructions: React.FC<InstructionsProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="uk-card uk-card-default uk-card-body">
      <div className="uk-card-title">{title}</div>
      <div className="uk-card-body">
        <p className="instructions_text_box">{description}</p>
        {children}
      </div>
    </div>
  );
};
export { Instructions };
