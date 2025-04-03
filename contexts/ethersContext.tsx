"use client";
import { ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { addToast } from "@heroui/react";
import { errorFunction, networks } from "@/utils/constants";

interface EthersState {
  currentNetworkId?: string;
  walletAddress: string | null;
};

const initialState: EthersState = {
  walletAddress: null,
};

interface EthersContext extends EthersState {
  requireNetwork: (chainId: keyof typeof networks) => Promise<void>;
  requireProvider: () => Promise<ethers.providers.Web3Provider>;
}

const ethersContext = createContext<EthersContext>({
  ...initialState,
  requireNetwork: errorFunction,
  requireProvider: errorFunction,
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
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [state, dispatch] = useReducer(ethersReducer, initialState);

  useEffect(() => {
    console.log("Initializing Ethers provider...");
    setProvider(new ethers.providers.Web3Provider(window.ethereum, 'any'))
  }, []);

  const requireProvider = useCallback(
    async () => {
      if (!provider) {
        throw new Error("Provider not initialized");
      }
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Web3 Accounts:", accounts);
      return provider;
    },
    [provider]
  );

  const requireNetwork = useCallback(async (chainKey: keyof typeof networks) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    const { chainId: currentChainId } = await provider.getNetwork();
    const { chainId: targetChainId } = networks[chainKey];
    if (ethers.utils.hexValue(targetChainId) !== ethers.utils.hexValue(currentChainId)) {
      addToast({ title: `Switching network to ${networks[chainKey].chainName}` });
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(targetChainId) }]);
      } catch (error) {
        const { code: errorCode } = error as { code: number };
        if (errorCode === 4902) {
          await provider.send("wallet_addEthereumChain", [networks[chainKey]]);
        } else {
          throw error;
        }
      }
    }
  }, [provider]);

  return (
    <ethersContext.Provider value={{
      ...state,
      requireNetwork,
      requireProvider,
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
