import { scaleQuantize } from "d3";
import { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import Button from "../components/button";
import Popover from "../components/popover";

import styles from "./index.module.css";

const bvcolor = scaleQuantize([
  "#ff4700",
  "#ff4b00",
  "#ff4f00",
  "#ff5300",
  "#ff5600",
  "#ff5900",
  "#ff5b00",
  "#ff5d00",
  "#ff6000",
  "#ff6300",
  "#ff6500",
  "#ff6700",
  "#ff6900",
  "#ff6b00",
  "#ff6d00",
  "#ff7000",
  "#ff7300",
  "#ff7500",
  "#ff7800",
  "#ff7a00",
  "#ff7c00",
  "#ff7e00",
  "#ff8100",
  "#ff8300",
  "#ff8506",
  "#ff870a",
  "#ff8912",
  "#ff8b1a",
  "#ff8e21",
  "#ff9127",
  "#ff932c",
  "#ff9631",
  "#ff9836",
  "#ff9a3c",
  "#ff9d3f",
  "#ffa148",
  "#ffa34b",
  "#ffa54f",
  "#ffa753",
  "#ffa957",
  "#ffab5a",
  "#ffad5e",
  "#ffb165",
  "#ffb269",
  "#ffb46b",
  "#ffb872",
  "#ffb975",
  "#ffbb78",
  "#ffbe7e",
  "#ffc184",
  "#ffc489",
  "#ffc78f",
  "#ffc892",
  "#ffc994",
  "#ffcc99",
  "#ffce9f",
  "#ffd1a3",
  "#ffd3a8",
  "#ffd5ad",
  "#ffd7b1",
  "#ffd9b6",
  "#ffdbba",
  "#ffddbe",
  "#ffdfc2",
  "#ffe1c6",
  "#ffe3ca",
  "#ffe4ce",
  "#ffe8d5",
  "#ffe9d9",
  "#ffebdc",
  "#ffece0",
  "#ffefe6",
  "#fff0e9",
  "#fff2ec",
  "#fff4f2",
  "#fff5f5",
  "#fff6f8",
  "#fff9fd",
  "#fef9ff",
  "#f9f6ff",
  "#f6f4ff",
  "#f3f2ff",
  "#eff0ff",
  "#ebeeff",
  "#e9edff",
  "#e6ebff",
  "#e3e9ff",
  "#e0e7ff",
  "#dee6ff",
  "#dce5ff",
  "#d9e3ff",
  "#d7e2ff",
  "#d3e0ff",
  "#c9d9ff",
  "#bfd3ff",
  "#b7ceff",
  "#afc9ff",
  "#a9c5ff",
  "#a4c2ff",
  "#9fbfff",
  "#9bbcff",
]).domain([3.347, -0.335]);

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

  const [showPopover, setShowPopover] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement>();

  const starRef = useRef<SVGSVGElement>();

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
      setShowPopover(false);
    }
  };

  const handleStar = (element: HTMLElement, starId: number) => {
    console.log(element);
    console.log(features.find((f) => f.id === starId));

    setSelectedStar(features.find((f) => f.id === starId));

    setPopoverTarget(element);
    setShowPopover(true);
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
              ? bvcolor(f.properties.bv)
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
    if (starRef.current) {
      window.scrollTo(
        (document.body.scrollWidth - window.innerWidth) / 2,
        (document.body.scrollHeight - window.innerHeight) / 2
      );
    }
  }, [starRef]);

  return (
    <>
      <svg
        className={styles.sky}
        ref={starRef}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 359.8019 178.2206"
        style={{
          height: `${178.2206 * zoom * 10}px`,
          width: `${359.8019 * zoom * 10}px`,
        }}
      >
        <defs>
          <radialGradient id="g">
            <stop stopColor="#FFFFFF" offset="0.1" />
            <stop stopColor="rgba(30, 30, 30, 0.5)" offset="0.2" />
          </radialGradient>
          <filter id="sofGlow" width="300%" height="300%" x="-100%" y="-100%">
            <feGaussianBlur in="thicken" stdDeviation="5" result="blurred" />
          </filter>
        </defs>
        <g>
          {constellationLines.map((line, lineIndex) =>
            line.geometry.paths.map((path, pathIndex) => (
              <path
                fill="transparent"
                key={`${lineIndex}-${pathIndex}`}
                stroke="#999999"
                strokeDasharray={0.2}
                strokeWidth={0.05}
                d={`M${path}`}
              />
            ))
          )}
        </g>
        <g>
          {features.map((feature) => (
            <circle
              className={[styles.star]
                .concat(
                  selectedStar?.id === feature.id ? styles.selected : null
                )
                .join(" ")}
              fill="url(#g)"
              key={feature.id}
              onClick={(e) => handleStar((e as any).target, feature.id)}
              cx={feature.geometry.coordinates[0]}
              cy={feature.geometry.coordinates[1]}
              r={0.5}
            />
          ))}
        </g>
        <g className={styles.constellations}>
          {constellations.map((constellation) => (
            <text
              fontSize={1}
              fill="#FFFFFF"
              key={constellation.properties.name}
              x={constellation.geometry.coordinates[0]}
              y={constellation.geometry.coordinates[1]}
            >
              {constellation.properties.name}
            </text>
          ))}
        </g>
      </svg>
      <div className={styles.zoom}>
        <button disabled={zoom === 2.5} onClick={() => setZoom(zoom + 0.25)}>
          +
        </button>
        <button disabled={zoom === 0.5} onClick={() => setZoom(zoom - 0.25)}>
          -
        </button>
      </div>
      <Popover
        onClose={() => {
          setSelectedStar(null);
          setShowPopover(false);
        }}
        show={showPopover}
        target={popoverTarget}
        title={`Star #${selectedStar?.id}`}
      >
        <div className={styles.starInfo}>
          <div className={styles.starInfoField}>
            <b className={styles.starInfoKey}>Owner</b>
            <span className={styles.starInfoValue}>
              {selectedStar?.properties.owner || "Nobody"}
            </span>
          </div>
          <div className={styles.starInfoField}>
            <b className={styles.starInfoKey}>Name</b>
            <span className={styles.starInfoValue}>
              {selectedStar?.properties.name || "Untitled"}
            </span>
          </div>
          <div className={styles.starInfoField}>
            <b className={styles.starInfoKey}>BV</b>
            <span className={styles.starInfoValue}>
              {selectedStar?.properties.bv}
            </span>
          </div>
          <div className={styles.starInfoField}>
            <b className={styles.starInfoKey}>Mag</b>
            <span className={styles.starInfoValue}>
              {selectedStar?.properties.mag}
            </span>
          </div>
        </div>
        <div className={styles.starInfoBuy}>
          <Button onClick={() => handleBuy()}>Buy for Ξ 0.001</Button>
        </div>
      </Popover>
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
