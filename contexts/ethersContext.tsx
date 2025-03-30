"use client";
import { BigNumber, ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import arweaveMappingAbi from "@/artifacts/contracts/ArweaveMapping.sol/ArweaveMapping.json";

interface EthersState {
  provider: ethers.providers.Web3Provider | null;
  currentNetworkId: string | null;
  walletAddress: string | null;
};

const initialState: EthersState = {
  provider: null,
  currentNetworkId: null,
  walletAddress: null,
};

export interface ArweaveMappingValue {
  address: string;
  arweaveId: string;
  price: string;
  description: string;
}

interface EthersContext extends EthersState {
  switchNetwork: (chainId: string) => Promise<void>;
  getTotalRegisteredAddresses: () => Promise<number>;
  getUploadedList: (offset: number, limit: number) => Promise<ArweaveMappingValue[]>;
  setArweaveMapping: (params: Omit<ArweaveMappingValue, 'address'>) => Promise<void>;
}

const ethersContext = createContext<EthersContext>({
  ...initialState,
  switchNetwork: async () => { },
  getTotalRegisteredAddresses: async () => { return 0; },
  getUploadedList: async () => { return []; },
  setArweaveMapping: async () => { },
});

type EthersAction =
  | { action: "CHANGE_NETWORK", networkId: string }
  | { action: "ADDRESS_CHANGES", address: string };

const ethersReducer = (state: EthersState, action: EthersAction): EthersState => {
  switch (action.action) {
    case "CHANGE_NETWORK":
      return { ...state, currentNetworkId: action.networkId };
    case "ADDRESS_CHANGES":
      return { ...state, walletAddress: action.address };
    default:
      return state;
  }
}

export const EthersProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [bscProvider, setBscProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [state, dispatch] = useReducer(ethersReducer, initialState);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const contractAddress = process.env.NEXT_PUBLIC_ARWEAVE_MAPPING_CONTRACT;
    if (!contractAddress) throw new Error("Contract address is not configured");
    if (!bscProvider) return;
    const newContract = new ethers.Contract(contractAddress, arweaveMappingAbi.abi, bscProvider);
    setContract(newContract);
  }, [bscProvider]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      dispatch({ action: "ADDRESS_CHANGES", address: accounts[0] });
    });
    provider.send("eth_requestAccounts", []).then((accounts: string[]) => {
      dispatch({ action: "ADDRESS_CHANGES", address: accounts[0] });
    });
    setProvider(provider);

    const bscProvider = new ethers.providers.JsonRpcProvider("https://broken-evocative-surf.bsc-testnet.quiknode.pro/11f750973f8f44ad331023073451c2eaee951114/");
    setBscProvider(bscProvider);
  }, []);

  useEffect(() => {
    (async () => {
      if (!provider) return;
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Web3 Accounts:", accounts);
    })();
  }, [provider]);

  const getTotalRegisteredAddresses = useCallback(async () => {
    if (!contract) return 0;
    const addresses = await contract.getTotalRegisteredAddresses() as BigNumber;
    console.log("Registered Addresses:", addresses, typeof addresses);
    return addresses.toNumber();
  }, [contract]);

  const getUploadedList = useCallback(async (offset: number, limit: number): Promise<ArweaveMappingValue[]> => {
    if (!contract) return [];
    const addresses = await contract.getRegisteredAddresses(offset, limit);
    console.log("Uploaded Addresses:", addresses);
    return addresses.map(([address, arweaveId, price, description]: string[]) => ({
      address,
      arweaveId,
      price,
      description,
    }));
  }, [contract]);

  const setArweaveMapping = useCallback<EthersContext["setArweaveMapping"]>(
    async (params: Omit<ArweaveMappingValue, 'address'>) => {
      const { arweaveId, price, description } = params;
      if (!provider || !contract) throw new Error("Provider or contract not initialized");
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.setArweaveTxId(arweaveId, description, price);
      await tx.wait();
    },
    [provider, contract]
  );

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!provider) throw new Error("Provider not initialized");
    await provider.send("wallet_switchEthereumChain", [{ chainId }]);
    dispatch({ action: "CHANGE_NETWORK", networkId: chainId });
  }, [provider]);

  return (
    <ethersContext.Provider value={{
      ...state,
      provider,
      switchNetwork,
      getTotalRegisteredAddresses,
      getUploadedList,
      setArweaveMapping
    }}>
      {children}
    </ethersContext.Provider>
  );
}

export function useEthers() {
  const context = useContext(ethersContext);
  if (!context) {
    throw new Error("useEthers must be used within an EthersProvider");
  }
  return context;
}
