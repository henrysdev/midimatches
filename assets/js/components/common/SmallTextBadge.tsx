import React from "react";

interface SmallTextBadgeProps {
  children?: any;
  extraStyles?: any;
}
const SmallTextBadge: React.FC<SmallTextBadgeProps> = ({
  children,
  extraStyles = {},
}) => {
  return (
    <span className="small_badge" style={extraStyles}>
      <strong>{children}</strong>
    </span>
  );
};
export { SmallTextBadge };
