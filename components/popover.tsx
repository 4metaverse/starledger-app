import { NextPage } from "next";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import styles from "./popover.module.css";

const Popover: NextPage<{
  onClose: () => void;
  show: boolean;
  target: HTMLElement;
  title: string;
}> = ({ children, onClose, show, target, title }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);

  const handleCloseClick = () => {
    onClose();
  };

  const hide = (event: Event) => {
    if (
      popoverRef.current?.contains(event.target as HTMLElement) ||
      target?.contains(event.target as HTMLElement)
    ) {
      return;
    }

    onClose();
  };

  const resize = () => {
    if (!popoverRef.current || !target) {
      return;
    }

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const targetCenter =
      targetRect.left + targetRect.width / 2 - popoverRect.width / 2;

    setLeft(targetCenter);
    setTop(targetRect.top + targetRect.height + 10);
  };

  useEffect(() => {
    document.body.addEventListener("mousedown", hide);
    return () => {
      document.body.removeEventListener("mousedown", hide);
    };
  }, []);

  useLayoutEffect(() => {
    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [target]);

  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={styles.popover}
      ref={popoverRef}
      style={{
        left,
        top,
      }}
    >
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p>{children}</p>
      </div>
    </div>,
    document.getElementById("popover-root")
  );
};

export default Popover;
