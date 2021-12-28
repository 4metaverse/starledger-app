import { NextPage } from "next";

import styles from "./icon.module.css";

const Icon: NextPage<{ size?: number }> = ({ children, size = 16 }) => {
  return (
    <span className={styles.icon} style={{ height: size, width: size }}>
      {children}
    </span>
  );
};

export default Icon;
