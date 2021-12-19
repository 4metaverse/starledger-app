import { useState } from "react";

import Button from "./button";
import Modal from "./modal";

import styles from "./header.module.css";

const Header = () => {
  const [account, setAccount] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleRequest = async () => {
    setShowModal(false);

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  return (
    <>
      <header className={styles.header}>
        <section className={styles.wrapper}>
          <h1 className={styles.logo}>metastellar</h1>
          {/* <nav className={styles.nav}>
            <ul className={styles.menu}>
              <li className={styles.menuItem}>
                <a href="#">My Stars</a>
              </li>
              <li className={styles.menuItem}>
                <a href="#">Search</a>
              </li>
              <li className={styles.menuItem}>
                <a href="#">About</a>
              </li>
            </ul>
          </nav> */}
          <div className={styles.network}>
            Metis Stardust Testnet
          </div>
          {account ? (
            <Button onClick={() => setAccount('')}>Close Wallet</Button>
          ) : (
            <Button icon="metamask" onClick={() => handleRequest()}>Connect Wallet</Button>
          )}
        </section>
      </header>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Connect Wallet"
      >
        {typeof window !== "undefined" &&
        typeof (window as any).ethereum !== "undefined"
          ? "Use MetaMask to login"
          : "Install MetaMask to login"}
        <button onClick={handleRequest}>Test</button>
      </Modal>
    </>
  );
};

export default Header;
