import { NextPage } from "next";

import styles from "./header.module.css";

const Header: NextPage<{
  account: string;
  onConnect: () => void;
  onDisconnect: () => void;
  wallet: "metamask" | "polis" | "none";
}> = ({ account, onConnect, onDisconnect, wallet }) => {
  return (
    <>
      <header className={styles.header}>
        <section className={styles.wrapper}>
          <h1 className={styles.logo}>
            <a href="https://starledger.org">Star<span>Ledger</span></a>
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
          <div className={styles.user}>
            <div className={styles.network}>
              {account ? account.substring(0, 12) : "Guest"}
            </div>
            {account ? (
              <button
                className={[
                  styles.connect,
                  wallet === "metamask"
                    ? styles.metamask
                    : wallet === "polis"
                    ? styles.polis
                    : styles.none,
                ].join(" ")}
                onClick={onDisconnect}
                title={wallet}
              >
                Close Wallet
              </button>
            ) : (
              <button className={styles.connect} onClick={onConnect}>
                Connect Wallet
              </button>
            )}
          </div>
        </section>
      </header>
    </>
  );
};

export default Header;
