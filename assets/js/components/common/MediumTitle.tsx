import React from "react";

interface MediumTitleProps {
  title: string;
}
const MediumTitle: React.FC<MediumTitleProps> = ({ title }) => {
  return (
    <div>
      <h3 className="uk-text-center">{title}</h3>
    </div>
  );
};
export { MediumTitle };
