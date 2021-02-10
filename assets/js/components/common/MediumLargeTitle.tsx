import React from "react";

interface MediumLargeTitleProps {
  title: string;
}
const MediumLargeTitle: React.FC<MediumLargeTitleProps> = ({ title }) => {
  return (
    <div>
      <h2 className="uk-text-center">{title}</h2>
    </div>
  );
};
export { MediumLargeTitle };
