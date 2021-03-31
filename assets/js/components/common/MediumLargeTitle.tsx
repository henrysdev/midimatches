import React from "react";

interface MediumLargeTitleProps {
  title?: string;
  children?: any;
  centered?: boolean;
  extraClasses?: string;
}
const MediumLargeTitle: React.FC<MediumLargeTitleProps> = ({
  title,
  children,
  centered = true,
  extraClasses = "",
}) => {
  return (
    <div>
      <h2
        className={
          centered
            ? `centered_title ${extraClasses}`
            : `left_title ${extraClasses}`
        }
      >
        {!!children ? children : !!title ? title : ""}
      </h2>
    </div>
  );
};
export { MediumLargeTitle };
