import { useState } from "react";

import Button from "./button";
import Modal from "./modal";

import styles from "./header.module.css";

const Header = () => {
  const [account, setAccount] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleRequest = async () => {
    if (!(await (window as any).ethereum)) {
      setShowModal(true);
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  return (
    <>
      <header className={styles.header}>
        <section className={styles.wrapper}>
          <h1 className={styles.logo}>
            Star<span>Ledger</span>
          </h1>
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
          <div className={styles.network}>Metis Stardust Testnet</div>
          {account ? (
            <Button onClick={() => setAccount("")}>Close Wallet</Button>
          ) : (
            <Button icon="metamask" onClick={() => handleRequest()}>
              Connect Wallet
            </Button>
          )}
        </section>
      </header>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="MetaMask Required"
      >
        <p>
          A connected wallet via MetaMask is required to continue.{" "}
          <a href="http://metamask.io">Click here</a> to learn more.
        </p>
      </Modal>
    </>
  );
};

export default Header;
