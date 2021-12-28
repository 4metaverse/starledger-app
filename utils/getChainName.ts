const chains = {
  "0x1": "Ethereum Mainnet (Mainnet)",
  "0x3": "Ropsten Testnet",
  "0x4": "Rinkeby Testnet",
  "0x5": "Goerli Testnet",
  "0x2a": "Kovan Testnet",
  "0x440": "Metis Andromeda Mainnet",
  "0x24c": "Metis Stardust Testnet",
};

export default (chainId: string) => {
  return chains[chainId] || "Unknown Network";
};
