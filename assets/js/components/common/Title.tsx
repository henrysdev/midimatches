import React from "react";

interface TitleProps {
  title: string;
}
const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <div>
      <h2 className="uk-text-center">{title}</h2>
    </div>
  );
};
export { Title };
