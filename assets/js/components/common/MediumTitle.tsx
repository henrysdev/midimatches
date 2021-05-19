import React from "react";

interface MediumTitleProps {
  title?: string;
  children?: any;
  centered?: boolean;
  extraStyles?: any;
}
const MediumTitle: React.FC<MediumTitleProps> = ({
  title,
  children,
  centered = true,
  extraStyles = {},
}) => {
  return (
    <div>
      <h4
        className={centered ? "centered_title" : "left_title"}
        style={extraStyles}
      >
        {!!children ? children : !!title ? title : ""}
      </h4>
    </div>
  );
};
export { MediumTitle };
