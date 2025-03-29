"use client";
import { ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";

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

interface EthersContext extends EthersState {
  switchNetwork: (chainId: string) => Promise<void>;
}

const ethersContext = createContext<EthersContext>({
  ...initialState,
  switchNetwork: async () => { },
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
  const [state, dispatch] = useReducer(ethersReducer, initialState);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      dispatch({ action: "ADDRESS_CHANGES", address: accounts[0] });
    });
    provider.send("eth_requestAccounts", []).then((accounts: string[]) => {
      dispatch({ action: "ADDRESS_CHANGES", address: accounts[0] });
    });
    setProvider(provider);
  }, []);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Web3 Accounts:", accounts);
    })();
  }, [provider]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!provider) throw new Error("Provider not initialized");
    await provider.send("wallet_switchEthereumChain", [{ chainId }]);
    dispatch({ action: "CHANGE_NETWORK", networkId: chainId });
  }, [provider]);

  return (
    <ethersContext.Provider value={{ ...state, provider, switchNetwork }}>
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