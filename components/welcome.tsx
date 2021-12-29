import { ReactElement, useEffect, useState } from "react";
import { NextPage } from "next";

import styles from "./welcome.module.css";
import Button from "./button";

const Welcome: NextPage<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState<string | ReactElement>("");
  const [text, setText] = useState<string | ReactElement>("");
  const [image, setImage] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome, earthling.",
      text: (
        <>
          <p>Explore over 5,000 stars in the StarLedger metaverse.</p>
          <p>Each star represents a star in our own universe.</p>
        </>
      ),
    },
    {
      title: "Look around.",
      text: "Drag the metasphere to see stars and constellations.",
      image: "/images/move.gif",
    },
    {
      title: "Get a closer look.",
      text: "Pinch to zoom in and out of the metasphere.",
      image: "/images/spread.gif",
    },
    {
      title: "Discover stars.",
      text: <>Tap to learn about a star's name, color and magnitude.</>,
      image: "/images/tap.gif",
    },
    {
      title: "Collect stars.",
      text: (
        <>
          Buy a Star NFT on the Metis Stardust Testnet network to own and trade
          it in the StarLedger metaverse.
        </>
      ),
      image: "/images/nft.gif",
    },
    {
      title: "Enjoy.",
      text: "It's a big metaverse out there...go explore!",
    },
  ];

  useEffect(() => {
    setIsAnimating(false);
    setTitle("");
    setText("");
    setImage("");

    setTimeout(() => {
      setIsAnimating(true);
      setTitle(steps[step].title);
      setText(steps[step].text);
      setImage(steps[step].image);
    }, 500);
  }, [step]);

  return (
    <>
      {isAnimating && (
        <>
          <div
            className={[
              styles.welcome,
              isAnimating ? styles.isAnimating : null,
            ].join(" ")}
          >
            <div className={styles.content}>
              <h2>{title}</h2>
              <p>{text}</p>
              <Button
                color="primary"
                onClick={() =>
                  step >= steps.length - 1 ? onComplete() : setStep(step + 1)
                }
              >
                {step === steps.length - 1 ? "Let's Go!" : "Next"}
              </Button>
              {step < steps.length - 1 && (
                <button className={styles.dismiss} onClick={() => onComplete()}>
                  Skip Instructions
                </button>
              )}
            </div>
          </div>
          {image && <img className={styles.image} src={image} />}
        </>
      )}
    </>
  );
};

export default Welcome;
