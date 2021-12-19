import { NextPage } from "next";
import ReactDOM from "react-dom";

import styles from "./modal.module.css";

const Modal: NextPage<{ onClose: () => void; show: boolean; title: string }> =
  ({ children, onClose, show, title }) => {
    const handleCloseClick = () => {
      onClose();
    };

    if (!show) {
      return null;
    }

    return ReactDOM.createPortal(
      <div className={styles.modal}>
        <div className={styles.content}>
          <h3>{title}</h3>
          <p>{children}</p>
          <button onClick={handleCloseClick}>Close</button>
        </div>
      </div>,
      document.getElementById("modal-root")
    );
  };

export default Modal;
