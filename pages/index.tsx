import { HttpClient, Oauth2Client } from "@metis.io/middleware-client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import Button from "../components/button";
import CloseIcon from "../components/closeIcon";
import Header from "../components/header";
import LinkIcon from "../components/linkIcon";
import Modal from "../components/modal";
import Welcome from "../components/welcome";
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
  const router = useRouter();
  const { localMap } = router.query;

  const searchRef = useRef<HTMLInputElement>();

  const [isWelcoming, setIsWelcoming] = useState(true);
  const [showTopStars, setShowTopStars] = useState(false);

  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainName, setChainName] = useState("");
  const [wallet, setWallet] = useState<"metamask" | "polis" | "none">("none");

  const [mapPerspective, setMapPerspective] = useState<"earth" | "overview">(
    "overview"
  );

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
  const [status, setStatus] = useState("");
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
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "approved",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "buyStar",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "getApproved",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "getStar",
          outputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct StarLedgerNFT.Star",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "string",
              name: "tokenURI",
              type: "string",
            },
          ],
          name: "mintStar",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
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
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "ownerOf",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "sellStar",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "starForSale",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "interfaceId",
              type: "bytes4",
            },
          ],
          name: "supportsInterface",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
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
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "tokenURI",
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
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as AbiItem[],
      process.env.STARLEDGER_CONTRACT_ADDRESS
    );

    // console.log(await NameContract.methods.getStar(selectedStar.id).call());

    await NameContract.methods
      .mintStar(
        selectedStar.id,
        process.env.STARLEDGER_ACCOUNT_ADDRESS,
        "QmSZxvJhwTsroKsy92XH7kovmW69Qi3FGb7DRvJMp8RXY1"
      )
      .send({ from: accounts[0] });

    // await NameContract.methods
    //   .buyStar(selectedStar.id, { value: 1 })
    //   .send({ from: accounts[0] });
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
      const feature = features.find((f) => f.id === data.data.id);
      setSelectedStar(feature);
    }
    if (data.type === "starHover") {
      const feature = features.find((f) => f.id === data.data.id);
      setStatus(feature ? feature.properties?.name || `HIP ${feature.id}` : "");
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
    const oauth2Client = new Oauth2Client();
    oauth2Client.startOauth2(
      process.env.POLIS_APP_ID,
      process.env.POLIS_REDIRECT_URL
    );
  };

  const handleSearchBlur = (e: MouseEvent) => {
    if (
      e.target === searchRef?.current ||
      searchRef?.current.contains(e.target as HTMLElement)
    ) {
      setHideSearchResults(false);
    } else {
      setHideSearchResults(true);
    }
  };

  const handleSearchResult = (id: number) => {
    setSelectedStar(features.find((f) => f.id === id));
    setSearchResults([]);
    setSearchTerms("");

    starRef.current.contentWindow.postMessage(
      {
        type: "selectStar",
        data: {
          id,
        },
      },
      "*"
    );
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
    starRef.current.contentWindow.postMessage(
      {
        type: "perspectiveChange",
        data: {
          perspective: mapPerspective,
        },
      },
      "*"
    );
  }, [mapPerspective]);

  useEffect(() => {
    if (polisUser) {
      setAccount(polisUser?.eth_address);
      setWallet("polis");
    }
  }, [polisUser]);

  useEffect(() => {
    window.addEventListener("click", handleSearchBlur);

    return () => {
      window.removeEventListener("click", handleSearchBlur);
    };
  }, [searchRef]);

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
        className={[
          styles.sky,
          !hideSearchResults ? styles.disabled : null,
        ].join(" ")}
        frameBorder={0}
        ref={starRef}
        src={
          localMap !== undefined
            ? "http://localhost:3000"
            : process.env.STARLEDGER_MAP_URL
        }
      ></iframe>
      {status && <div className={styles.status}>{status}</div>}
      {/* <div className={styles.mapPerspective}>
        <button
          className={[
            styles.toggle,
            mapPerspective === "overview" ? styles.toggleSelected : null,
          ].join(" ")}
          onClick={() => setMapPerspective("overview")}
        >
          Overview
        </button>
        <button
          className={[
            styles.toggle,
            mapPerspective === "earth" ? styles.toggleSelected : null,
          ].join(" ")}
          onClick={() => setMapPerspective("earth")}
        >
          Earth View
        </button>
      </div> */}
      <div className={styles.search} ref={searchRef}>
        <input
          onChange={(e) => setSearchTerms(e.target.value)}
          onFocus={() => setHideSearchResults(false)}
          placeholder="Search for stars..."
          type="text"
          value={searchTerms}
        />
        {searchResults && !hideSearchResults && (
          <ul className={styles.results}>
            {searchResults.map((result) => (
              <li key={result.id}>
                <button onClick={() => handleSearchResult(result.id)}>
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
      {!selectedStar && !isWelcoming && (
        <div className={styles.suggestions}>
          <button
            className={styles.expandButton}
            onClick={() => setShowTopStars(!showTopStars)}
          >
            Popular Stars
          </button>
          {showTopStars && (
            <ul>
              <li>
                <button onClick={() => handleSearchResult(11767)}>
                  Polaris
                </button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(32349)}>
                  Sirius
                </button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(27989)}>
                  Betelgeuse
                </button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(24436)}>Rigel</button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(91262)}>Vega</button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(80763)}>
                  Antares
                </button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(30438)}>
                  Canopus
                </button>
              </li>
              <li>
                <button onClick={() => handleSearchResult(37279)}>
                  Procyon
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
      {selectedStar && !isWelcoming && (
        <div className={styles.details}>
          <div className={styles.detailsContent}>
            <h3>
              {selectedStar?.properties.name || `HIP ${selectedStar?.id}`}
            </h3>
            <div className={styles.starInfo}>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>Number</span>
                <span className={styles.starInfoValue}>{selectedStar?.id}</span>
              </div>
              <div className={styles.starInfoField}>
                <span className={styles.starInfoKey}>Owner</span>
                <span className={styles.starInfoValue}>
                  {selectedStar?.properties.owner || "0x3FC7FC"}
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
              {/* <Button
                color="primary"
                onClick={() =>
                  wallet === "none" ? setModalType("connect") : handleBuy()
                }
              >
                {wallet === "none" ? "Connect Wallet" : "Buy Star"}
              </Button> */}
              <Button color="primary" disabled onClick={() => handleBuy()}>
                Not for Sale
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
      {isWelcoming && <Welcome onComplete={() => setIsWelcoming(false)} />}
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
                {!(window as any).ethereum?.isMetaMask && (
                  <div className={styles.modalButtonError}>(Not Installed)</div>
                )}
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
