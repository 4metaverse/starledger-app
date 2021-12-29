import { useEffect, useState } from "react";
import { NextPage } from "next";

import styles from "./welcome.module.css";

const Welcome: NextPage<{ size?: number }> = () => {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");

  const steps = [
    {
      title: "Welcome to StarLedger",
    },
    {
      title: "Drag to explore the star metaverse",
    },
    {
      title: "Pinch to zoom in/out",
    },
    {
      title:
        "When you find a star you like, ap it to see details and buy a star",
    },
  ];

  useEffect(() => {
    setTitle(steps[step].title);
  }, [step]);

  return (
    <div className={styles.welcome}>
      <h2>{title}</h2>
      {step > 0 && <button onClick={() => setStep(step - 1)}></button>}
      <button onClick={step > 3 ? null : () => setStep(step + 1)}>
        {step === 3 ? "Done" : "Next"}
      </button>
    </div>
  );
};

export default Welcome;
