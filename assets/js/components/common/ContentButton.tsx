import React from "react";

interface ContentButtonProps {
  children?: any;
  callback: Function;
}
const ContentButton: React.FC<ContentButtonProps> = ({
  children,
  callback,
}) => {
  return (
    <div onClick={() => callback()} className="content_button relative_anchor">
      <div className="centered_div">{children}</div>
    </div>
  );
};
export { ContentButton };
