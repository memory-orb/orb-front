import { AccsDefaultParams } from "@lit-protocol/types";

export const errorFunction = () => { throw new Error("Function not implemented"); };

export const DEFAULT_CONDITION: Readonly<AccsDefaultParams> = {
  contractAddress: '',
  standardContractType: '',
  chain: 'sepolia',
  method: 'eth_getBalance',
  parameters: [":userAddress"],
  returnValueTest: {
    comparator: '>',
    value: '0'
  }
};

export const networks: Record<"bscTestnet" | "litTestnet", {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}> = {
  bscTestnet: {
    chainId: "0x61",
    chainName: "BNB Chain Testnet",
    rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.bscscan.com"]
  },
  litTestnet: {
    chainId: "0x2AC54",
    chainName: "Chronicle Yellowstone - Lit Protocol Testnet",
    rpcUrls: ["https://yellowstone-rpc.litprotocol.com"],
    nativeCurrency: {
      name: "Lit Protocol - Chronicle Yellowstone Testnet Token (tstLPX)",
      symbol: "tstLPX",
      decimals: 18
    },
    blockExplorerUrls: ["https://yellowstone-explorer.litprotocol.com"]
  }
}
