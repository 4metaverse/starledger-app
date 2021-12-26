import { Oauth2Client } from '@metis.io/middleware-client';
import { useState } from "react";

import Button from "./button";
import Modal from "./modal";

import styles from "./header.module.css";

const Header = () => {
  const [account, setAccount] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    setShowModal(true);
  };

  const handleMetaMask = async () => {
    if (!(await (window as any).ethereum)) {
      setShowModal(true);
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  const handlePolis = () => {
    console.log(process.env);
    console.log(process.env.POLIS_APP_ID);
    console.log(process.env.POLIS_REDIRECT_URL);

    const oauth2Client = new Oauth2Client();
		oauth2Client.startOauth2(
			process.env.POLIS_APP_ID,
			process.env.POLIS_REDIRECT_URL
		);
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
            <Button onClick={() => handleConnect()}>
              Connect Wallet
            </Button>
          )}
        </section>
      </header>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Connect Wallet"
      >
        <p>
          To use StarLedger, connect your Ethereum wallet using a provider below.
        </p>
        <div>
          <Button icon="polis-logo.png" onClick={() => handlePolis()}>
            Polis
          </Button>
          <Button icon="metamask-logo.svg" onClick={() => handleMetaMask()}>
            MetaMask
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Header;
