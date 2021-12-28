import { HttpClient, Oauth2Client } from "@metis.io/middleware-client";
import { NextPage } from "next";
import { ReactElement, useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import Button from "../components/button";
import CloseIcon from "../components/closeIcon";
import Header from "../components/header";
import LinkIcon from "../components/linkIcon";
import Modal from "../components/modal";
import getChainName from "../utils/getChainName";

import styles from "./index.module.css";

const IndexPage: NextPage<{
  polisClient: HttpClient;
  polisUser: {
    balance: string;
    display_name: string;
    email: string;
    eth_address: string;
    last_login_time: number;
    username: string;
  };
}> = ({ polisClient, polisUser }) => {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainName, setChainName] = useState("");
  const [wallet, setWallet] = useState<"metamask" | "polis" | "none">("none");

  const [errorMessage, setErrorMessage] = useState<string | ReactElement>("");
  const [errorTimer, setErrorTimer] = useState<NodeJS.Timer>();

  const [features, setFeatures] = useState<
    {
      geometry: {
        coordinates: number[];
        type: "Point";
      };
      id: number;
      properties: {
        owner?: string;
        name: string;
        mag: number;
        bv: string;
        hex: string;
      };
      type: "Feature";
    }[]
  >([]);
  const [hideSearchResults, setHideSearchResults] = useState(true);
  const [searchTerms, setSearchTerms] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);
  const [selectedStar, setSelectedStar] = useState<{
    geometry: {
      coordinates: number[];
      type: "Point";
    };
    id: number;
    properties: {
      owner?: string;
      name: string;
      mag: number;
      bv: string;
      hex: string;
    };
    type: "Feature";
  }>();
  const [zoom, setZoom] = useState(1);

  const [modalType, setModalType] = useState<"" | "connect" | "invalidNetwork">(
    ""
  );

  const starRef = useRef<HTMLIFrameElement>();

  const handleBuy = async () => {
    if (wallet === "polis") {
      await polisClient.sendTxAsync("starledger", 588, "buy", []);
      return;
    }

    const web3 = new Web3((window as any).ethereum);
    await (window as any).ethereum.enable();

    const accounts = await web3.eth.getAccounts();

    const NameContract = new web3.eth.Contract(
      [
        {
          inputs: [
            {
              internalType: "string",
              name: "_greeting",
              type: "string",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "greet",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_greeting",
              type: "string",
            },
          ],
          name: "setGreeting",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as AbiItem[],
      "0x8BF576e789c14a6578DE1cAe7E3Cea6fa57b0d83"
    );

    await NameContract.methods.setGreeting("oy").send({ from: accounts[0] });
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(chainId);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedStar(null);
    }
  };

  const handleMessage = ({ data }) => {
    if (data.type === "selectStar") {
      setSelectedStar(features.find((f) => f.id === data.data.id));
    }
  };

  const handleMetaMask = async () => {
    if (!(await (window as any).ethereum)) {
      setModalType("connect");
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });

    const web3 = new Web3((window as any).ethereum);
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log(web3.utils.fromWei(balance, "ether"));

    setAccount(accounts[0]);
    setChainId((window as any).ethereum.chainId);
    setWallet("metamask");

    if ((window as any).ethereum.chainId !== "0x24c") {
      setModalType("invalidNetwork");
    } else {
      setModalType("");
    }
  };

  const handleNetwork = async () => {
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x24c" }],
      });
    } catch (error) {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }

      setErrorMessage(
        error.code === 4902 ? (
          <>
            To continue, you must use the <b>Metis Stardust Testnet</b> network.{" "}
            <a
              href="https://chainlist.org/?search=metis"
              rel="noopener noreferrer"
              target="_blank"
            >
              Launch Chainlist
            </a>{" "}
            to quickly add this network to MetaMask. Then try again.
          </>
        ) : (
          "Unknown error. Please try again."
        )
      );

      const newErrorTimer = setTimeout(() => {
        setErrorMessage("");
      }, 10000);

      setErrorTimer(newErrorTimer);
    }
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

  const handleSearchResult = (id: number) => {
    setSelectedStar(features.find((f) => f.id === id));
    setSearchResults([]);
    setSearchTerms("");

    starRef.current.contentWindow.window.postMessage({ id });
  };

  const load = async () => {
    const data = await fetch("/data/stars.6.json");
    const { features: newFeatures } = await data.json();

    const starNameData = await fetch("/data/starnames.json");
    // const { features: newStarNames } = await starNameData.json();
    const starNames = await starNameData.json();

    setFeatures(
      newFeatures.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          name: starNames[f.id]?.name,
        },
      }))
    );

    // const web3 = new Web3((window as any).ethereum);
    // if (await (window as any).ethereum) {
    //   await (window as any).ethereum.enable();

    //   const NameContract = new web3.eth.Contract(
    //     [
    //       {
    //         inputs: [
    //           {
    //             internalType: "string",
    //             name: "_greeting",
    //             type: "string",
    //           },
    //         ],
    //         stateMutability: "nonpayable",
    //         type: "constructor",
    //       },
    //       {
    //         inputs: [],
    //         name: "greet",
    //         outputs: [
    //           {
    //             internalType: "string",
    //             name: "",
    //             type: "string",
    //           },
    //         ],
    //         stateMutability: "view",
    //         type: "function",
    //       },
    //       {
    //         inputs: [
    //           {
    //             internalType: "string",
    //             name: "_greeting",
    //             type: "string",
    //           },
    //         ],
    //         name: "setGreeting",
    //         outputs: [],
    //         stateMutability: "nonpayable",
    //         type: "function",
    //       },
    //     ] as AbiItem[],
    //     "0x8BF576e789c14a6578DE1cAe7E3Cea6fa57b0d83"
    //   );

    //   console.log(await NameContract.methods.greet().call());
    // }
  };

  useEffect(() => {
    load();

    window.addEventListener("keydown", handleKey);
    if ((window as any).ethereum) {
      (window as any).ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      window.removeEventListener("keydown", handleKey);

      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener(
          "chainChanged",
          handleChainChanged
        );
      }
    };
  }, []);

  useEffect(() => {
    console.log("chainId", chainId);
    if (chainId !== "" && chainId !== "0x24c") {
      setModalType("invalidNetwork");
    } else {
      setModalType("");
    }
    setChainName(getChainName(chainId));
  }, [chainId]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [features]);

  useEffect(() => {
    setAccount(polisUser?.eth_address);
    setWallet("polis");
  }, [polisUser]);

  useEffect(() => {
    if (!searchTerms) {
      setSearchResults([]);
      return;
    }

    setSearchResults(
      features
        .filter((feature) =>
          feature.properties.name
            ?.toLowerCase()
            .includes(searchTerms.toLowerCase())
        )
        .map((result) => ({
          id: result.id,
          name: result.properties.name,
        }))
    );
  }, [searchTerms]);

  useEffect(() => {
    if (starRef.current) {
      window.scrollTo(
        (document.body.scrollWidth - window.innerWidth) / 2,
        (document.body.scrollHeight - window.innerHeight) / 2
      );
    }
  }, [starRef]);

  return (
    <>
      <Header
        account={account}
        onConnect={() => setModalType("connect")}
        onDisconnect={() => {
          sessionStorage.clear();
          window.location.reload();
        }}
        wallet={wallet}
      />
      <iframe
        className={styles.sky}
        frameBorder={0}
        ref={starRef}
        src="https://connect-app.starledger-map.pages.dev"
        // src="http://localhost:3002"
      ></iframe>
      <div className={styles.search}>
        <input
          onBlur={() => setHideSearchResults(true)}
          onChange={(e) => setSearchTerms(e.target.value)}
          onFocus={(e) => setHideSearchResults(false)}
          placeholder="Search for stars..."
          type="text"
          value={searchTerms}
        />
        {searchResults && !hideSearchResults && (
          <ul className={styles.results}>
            {searchResults.map((result) => (
              <li key={result.id}>
                <button onMouseDown={() => handleSearchResult(result.id)}>
                  {result.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.zoom}>
        <button disabled={zoom === 2.5} onClick={() => setZoom(zoom + 0.25)}>
          +
        </button>
        <button disabled={zoom === 0.5} onClick={() => setZoom(zoom - 0.25)}>
          -
        </button>
      </div>
      {!selectedStar && (
        <div className={styles.details}>
          <h4>Click a star to begin</h4>
        </div>
      )}
      {selectedStar && (
        <div className={styles.details}>
          <div className={styles.detailsContent}>
            <h3>Star #{selectedStar?.id}</h3>
            <div className={styles.starInfo}>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>Owner</span>
                <span className={styles.starInfoValue}>
                  {selectedStar?.properties.owner || "Nobody"}
                </span>
              </div>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>Name</span>
                <span className={styles.starInfoValue}>
                  {selectedStar?.properties.name || "Untitled"}
                </span>
              </div>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>BV</span>
                <span className={styles.starInfoValue}>
                  {selectedStar?.properties.bv}
                </span>
              </div>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>Mag</span>
                <span className={styles.starInfoValue}>
                  {selectedStar?.properties.mag}
                </span>
              </div>
            </div>
            <div className={styles.starInfoBuy}>
              <Button color="primary" onClick={() => handleBuy()}>
                Buy for Ξ 0.001
              </Button>
            </div>
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        <a
          href="https://austincodeshop.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          &copy; 2021 Austin Code Shop LLC
        </a>
      </footer>
      {errorMessage && (
        <div className={styles.error}>
          <div className={styles.errorMessage}>{errorMessage}</div>
          <button
            className={styles.errorClose}
            onClick={() => setErrorMessage("")}
          >
            <CloseIcon size={24} />
          </button>
        </div>
      )}
      <Modal
        canClose={modalType === "connect"}
        onClose={() => setModalType("")}
        show={modalType !== ""}
        title={modalType === "connect" ? "Connect Wallet" : "Invalid Network"}
      >
        {modalType === "connect" && (
          <div className={styles.connectModal}>
            <p>
              To use StarLedger, connect your Ethereum wallet using a provider
              below.
            </p>
            <div className={styles.modalButtons}>
              <div>
                <Button
                  color="transparent"
                  icon="polis-logo.png"
                  onClick={() => handlePolis()}
                >
                  Polis
                </Button>
              </div>
              <div>
                <Button
                  color="transparent"
                  disabled={!(window as any).ethereum?.isMetaMask}
                  icon="metamask-logo.svg"
                  onClick={() => handleMetaMask()}
                >
                  MetaMask
                </Button>
                <div className={styles.modalButtonError}>(Not Installed)</div>
              </div>
            </div>
          </div>
        )}
        {modalType === "invalidNetwork" && (
          <div className={styles.invalidNetworkModal}>
            <p>
              Use MetaMask to switch to the Metis Stardust Testnet network or
              click the button below to disconnect.
            </p>
            <ul>
              <li>
                <b>
                  Required: Metis Stardust Testnet{" "}
                  <a
                    href="https://chainlist.org/?search=metis"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <LinkIcon />
                  </a>
                </b>
              </li>
              <li>
                <span>Current: {chainName}</span>
              </li>
            </ul>
            <div>
              <Button
                color="secondary"
                onClick={() => {
                  sessionStorage.clear();
                  window.location.reload();
                }}
              >
                Disconnect
              </Button>
              <Button color="primary" onClick={() => handleNetwork()}>
                Switch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default IndexPage;
