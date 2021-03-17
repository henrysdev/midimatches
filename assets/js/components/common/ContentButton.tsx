import React from "react";

interface ContentButtonProps {
  children?: any;
  callback: Function;
  styles?: any;
}
const ContentButton: React.FC<ContentButtonProps> = ({
  children,
  callback,
  styles = {},
}) => {
  return (
    <div
      onClick={() => callback()}
      className="content_button relative_anchor"
      style={styles}
    >
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { ContentButton };
