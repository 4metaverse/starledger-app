import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import Button from "../components/button";

import styles from "./index.module.css";

function IndexPage() {
  const [constellationLines, setConstellationLines] = useState<
    {
      geometry: {
        coordinates: number[][][];
        paths: string[];
        type: "MultiLineString";
      };
      id: number;
      properties: {
        name: string;
      };
      type: "Feature";
    }[]
  >([]);
  const [constellations, setConstellations] = useState<
    {
      geometry: {
        coordinates: number[];
        type: "Point";
      };
      id: number;
      properties: {
        name: string;
      };
      type: "Feature";
    }[]
  >([]);
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

  const starRef = useRef<HTMLIFrameElement>();

  const handleBuy = async () => {
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

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedStar(null);
    }
  };

  const handleSearchResult = (id: number) => {
    setSelectedStar(features.find((f) => f.id === id));
    setSearchResults([]);
    setSearchTerms('');
  };

  const handleStar = (event: CustomEvent) => {
    console.log("handleStar");
    console.log(event.detail.id);
    console.log(features);

    console.log(features.find((f) => f.id === event.detail.id));

    setSelectedStar(features.find((f) => f.id === event.detail.id));
  };

  const load = async () => {
    const data = await fetch("/data/stars.6.json");
    const { features: newFeatures } = await data.json();

    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    newFeatures.forEach((f) => {
      if (f.geometry.coordinates[0] < minX) {
        minX = f.geometry.coordinates[0];
      }
      if (f.geometry.coordinates[1] < minY) {
        minY = f.geometry.coordinates[1];
      }
      if (f.geometry.coordinates[0] > maxX) {
        maxX = f.geometry.coordinates[0];
      }
      if (f.geometry.coordinates[1] > maxY) {
        maxY = f.geometry.coordinates[1];
      }
    });

    console.log(minX, minY, maxX, maxY);

    const starNameData = await fetch("/data/starnames.json");
    // const { features: newStarNames } = await starNameData.json();
    const starNames = await starNameData.json();

    console.log(newFeatures.length);

    setFeatures(
      newFeatures.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          hex:
            typeof f.properties.bv === "string"
              ? // TODO: replace with new bv2rgb function
                // ? bvcolor(f.properties.bv)
                "#FFFFFF"
              : "#FFFFFF",
          name: starNames[f.id]?.name,
        },
        geometry: {
          ...f.geometry,
          coordinates: [
            -f.geometry.coordinates[0] + -minX,
            -f.geometry.coordinates[1] + -minY,
          ],
        },
      }))
    );

    const constellationData = await fetch("/data/constellations.json");
    const { features: newConstellations } = await constellationData.json();

    setConstellations(
      newConstellations.map((f) => ({
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: [
            -f.geometry.coordinates[0] + -minX,
            -f.geometry.coordinates[1] + -minY,
          ],
        },
      }))
    );

    const constellationLineData = await fetch(
      "/data/constellations.lines.json"
    );
    const { features: newConstellationLines } =
      await constellationLineData.json();

    setConstellationLines(
      newConstellationLines.map((f) => ({
        ...f,
        geometry: {
          ...f.geometry,
          paths: f.geometry.coordinates.map((c) =>
            c.map((d) => [-d[0] + -minX, -d[1] + -minY]).join(" ")
          ),
        },
      }))
    );

    const web3 = new Web3((window as any).ethereum);
    if (await (window as any).ethereum) {
      await (window as any).ethereum.enable();

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

      console.log(await NameContract.methods.greet().call());
    }
  };

  useEffect(() => {
    load();

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("selectStar", handleStar);

    return () => {
      window.removeEventListener("selectStar", handleStar);
    };
  }, [features]);

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
      <iframe
        className={styles.sky}
        frameBorder={0}
        ref={starRef}
        src="https://connect-app.starledger-map.pages.dev"
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
        <div className={styles.details}><h4>Click a star to begin</h4></div>
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
              <Button onClick={() => handleBuy()}>Buy for Ξ 0.001</Button>
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
    </>
  );
}

export default IndexPage;
