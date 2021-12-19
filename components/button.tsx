import { NextPage } from "next";

import styles from "./button.module.css";

const Button: NextPage<{ icon?: string; onClick: () => void }> = ({
  children,
  icon,
  onClick,
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      className={[styles.button].concat(icon ? styles.icon : null).join(" ")}
      onClick={handleClick}
      style={{ backgroundImage: icon ? `url(/images/${icon}.svg)` : null }}
    >
      {children}
    </button>
  );
};

export default Button;
