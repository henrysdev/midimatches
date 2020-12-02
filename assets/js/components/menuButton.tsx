import React from "react";

interface MenuButtonProps {
  label: string;
  callback: Function;
  disabled: boolean;
}
const MenuButton: React.FC<MenuButtonProps> = ({disabled, label, callback}) => {
  return (
    <button disabled={disabled} onClick={() => callback()}>
      {label}
    </button>
  );
};
export default MenuButton;