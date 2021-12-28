import { NextPage } from "next";

import styles from "./button.module.css";

const Button: NextPage<{ color: 'primary' | 'secondary' | 'transparent'; disabled?: boolean; icon?: string; onClick: () => void }> = ({
  color,
  children,
  disabled = false,
  icon,
  onClick,
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      className={[styles.button, styles[color]].concat(icon ? styles.icon : null).join(" ")}
      disabled={disabled}
      onClick={handleClick}
      style={{ backgroundImage: icon ? `url(/images/${icon})` : null }}
    >
      {children}
    </button>
  );
};

export default Button;
