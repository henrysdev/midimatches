import React from "react";

interface ContentButtonProps {
  children?: any;
  callback: Function;
  styles?: any;
  disabled?: boolean;
}
const ContentButton: React.FC<ContentButtonProps> = ({
  children,
  callback,
  styles = {},
  disabled = false,
}) => {
  return disabled ? (
    <div className={"content_button relative_anchor frozen"} style={styles}>
      <div className="centered_div">{children}</div>
    </div>
  ) : (
    <div
      onClick={() => callback()}
      className={"content_button relative_anchor"}
      style={styles}
    >
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { ContentButton };
