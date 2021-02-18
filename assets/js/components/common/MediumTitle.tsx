import React from "react";

interface MediumTitleProps {
  title?: string;
  children?: any;
  centered?: boolean;
}
const MediumTitle: React.FC<MediumTitleProps> = ({
  title,
  children,
  centered = true,
}) => {
  return (
    <div>
      <h4 className={centered ? "centered_title" : "left_title"}>
        {!!children ? children : !!title ? title : ""}
      </h4>
    </div>
  );
};
export { MediumTitle };
