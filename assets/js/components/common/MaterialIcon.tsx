import * as React from "react";

interface MaterialIconProps {
  iconName: string;
  style?: any;
  className?: string;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  iconName,
  style = {},
  className: extraClasses = "",
}) => (
  <i
    style={{ verticalAlign: "middle", ...style }}
    className={`material-icons ${extraClasses}`}
  >
    {iconName}
  </i>
);

export { MaterialIcon };
