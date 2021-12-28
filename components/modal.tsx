import { NextPage } from "next";
import ReactDOM from "react-dom";

import styles from "./modal.module.css";

const Modal: NextPage<{
  canClose: boolean;
  onClose: () => void;
  show: boolean;
  title: string;
}> = ({ canClose, children, onClose, show, title }) => {
  const handleCloseClick = () => {
    onClose();
  };

  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div>{children}</div>
        {canClose && (
          <button className={styles.close} onClick={handleCloseClick}>
            X
          </button>
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
