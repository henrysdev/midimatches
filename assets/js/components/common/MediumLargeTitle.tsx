import React from "react";

interface MediumLargeTitleProps {
  title?: string;
  children?: any;
  centered?: boolean;
}
const MediumLargeTitle: React.FC<MediumLargeTitleProps> = ({
  title,
  children,
  centered = true,
}) => {
  return (
    <div>
      <h2 className={centered ? "centered_title" : "left_title"}>
        {!!children ? children : !!title ? title : ""}
      </h2>
    </div>
  );
};
export { MediumLargeTitle };
