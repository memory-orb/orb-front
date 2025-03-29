"use client";
import { LPACC_EVM_BASIC } from "@lit-protocol/accs-schemas";
import { createSiweMessageWithRecaps, generateAuthSig, LitAccessControlConditionResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { encryptFile as litEncryptFile } from "@lit-protocol/encryption";
import { disconnectWeb3, LitNodeClient } from "@lit-protocol/lit-node-client";
import { AccessControlConditions, EncryptResponse, LIT_NETWORKS_KEYS, LitResourceAbilityRequest } from "@lit-protocol/types";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { useEthers } from "./ethersContext";

interface LitProtocolProviderState {
  status: "disconnected" | "connecting" | "connected";
}

const initialState: LitProtocolProviderState = {
  status: "connecting",
}

interface LitProtocolContext extends LitProtocolProviderState {
  litNodeClient?: LitNodeClient;
  switchLitNetwork: (network: LIT_NETWORKS_KEYS) => void;
  encryptFile: (file: Blob, condition: AccessControlConditions) => Promise<EncryptResponse>;
  decryptFile: (data: {
    ciphertext: string,
    dataToEncryptHash: string,
    condition: AccessControlConditions,
    onProcess: (status: string) => void,
  }) => Promise<Blob>;
}

const LitProtocolContext = createContext<LitProtocolContext>({
  ...initialState,
  switchLitNetwork: () => { },
  encryptFile: () => { throw new Error("encryptFile not implemented"); },
  decryptFile: () => { throw new Error("decryptFile not implemented"); },
});

export type LitProtocolProviderAction =
  | { type: "DISCONNECTED" }
  | { type: "CONNECTED" }
  | { type: "CONNECTING" };

const litProtocolStateReducer = (state: LitProtocolProviderState, action: LitProtocolProviderAction): LitProtocolProviderState => {
  switch (action.type) {
    case "DISCONNECTED":
      return {
        ...state,
        status: "disconnected",
      };
    case "CONNECTED":
      return {
        ...state,
        status: "connected",
      };
    default:
      return state;
  }
}

export function LitProtocolProvider({ children }: { children: React.ReactNode }) {
  const [litNodeClient, setLitNodeClient] = useState<LitNodeClient>(() => new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
  }));
  const { provider } = useEthers();
  const [state, dispatch] = useReducer(litProtocolStateReducer, initialState);
  const initialized = useRef(false);
  const [usedBlockchain] = useState<LPACC_EVM_BASIC["chain"]>("sepolia");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        dispatch({ type: "CONNECTING" });
        await litNodeClient.connect();
        dispatch({ type: "CONNECTED" });
      } catch (error) {
        console.error("Lit client connect error:", error);
        dispatch({ type: "DISCONNECTED" });
      }
    })();
  }, [litNodeClient]);

  const switchLitNetwork = useCallback((network: LIT_NETWORKS_KEYS) => {
    const newClient = new LitNodeClient({
      litNetwork: network,
    });
    (async () => {
      try {
        dispatch({ type: "CONNECTING" });
        setLitNodeClient(newClient);
        await newClient.connect();
        dispatch({ type: "CONNECTED" });
      } catch (error) {
        console.error("Lit client connect error:", error);
        dispatch({ type: "DISCONNECTED" });
      }
    })();
  }, []);

  const encryptFile = useCallback(async (file: Blob, condition: AccessControlConditions): Promise<EncryptResponse> => {
    if (state.status !== "connected") {
      throw new Error("LitNodeClient is not connected");
    }
    try {
      console.log("Encrypting using condition:", condition);
      const res = await litEncryptFile({
        chain: usedBlockchain,
        file,
        accessControlConditions: condition,
      }, litNodeClient);
      console.log("Encrypt Res:", res);
      return res;
    } catch (error) {
      console.error("Error encrypting file:", error);
      throw error;
    }
  }, [litNodeClient, state, usedBlockchain]);

  const getSessionSignatures = useCallback(async (condition: AccessControlConditions, onProcess: (_: string) => void) => {
    if (!provider) return;
    // Connect to the wallet
    const { chainId } = await provider.getNetwork();
    if (chainId !== 175188) {
      try {
        await provider.send("wallet_switchEthereumChain", [{
          chainId: "0x2AC54"
        }]);
      } catch (error) {
        console.error("Switch chain error:", error);
        if ((error as { code?: number }).code !== 4902) {
          throw error;
        }
        await provider.send("wallet_addEthereumChain", [{
          chainId: "0x2AC54",
          chainName: "Chronicle Yellowstone - Lit Protocol Testnet",
          nativeCurrency: {
            name: "Lit Protocol - Chronicle Yellowstone Testnet Token (tstLPX)",
            symbol: "tstLPX",
            decimals: 18
          },
          rpcUrls: ["https://yellowstone-rpc.litprotocol.com"],
          blockExplorerUrls: ["https://yellowstone-explorer.litprotocol.com"]
        }])
        await provider.send("wallet_switchEthereumChain", [{
          chainId: "0x2AC54"
        }]);
      }
    }
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();
    console.log("Signer:", signer);
    const walletAddress = await signer.getAddress();
    console.log("Connected account:", walletAddress);

    // Get the latest blockhash
    onProcess("Getting latest blockhash...");
    const latestBlockhash = await litNodeClient.getLatestBlockhash();
    console.log("Latest blockhash:", latestBlockhash);

    const contractClient = new LitContracts({
      signer: provider.getSigner(),
      network: LIT_NETWORK.DatilDev,
    });
    onProcess("Connecting to Lit contract client...");
    await contractClient.connect();
    console.log("Contract client:", contractClient);

    onProcess("Minting capacity credits NFT...");
    const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 80,
      // requestsPerDay: 14400,
      // requestsPerSecond: 10,
      daysUntilUTCMidnightExpiration: 2,
    });
    console.log("Capacity token ID:", capacityTokenIdStr);

    onProcess("Creating capacity delegation auth sig...");
    const { capacityDelegationAuthSig } = await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: signer,
      uses: '1',
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [await signer.getAddress()],
    });
    console.log("Capacity delegation auth sig:", capacityDelegationAuthSig);

    onProcess("Getting session signatures...");
    // Get the session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: usedBlockchain,
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource('*'),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async function (params: {
        uri?: string;
        expiration?: string;
        resourceAbilityRequests?: LitResourceAbilityRequest[]
      }) {
        if (!params.uri) throw new Error("uri is required");
        if (!params.expiration) throw new Error("expiration is required");
        if (!params.resourceAbilityRequests) throw new Error("resourceAbilityRequests is required");

        // Create the SIWE message
        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: await signer.getAddress(),
          nonce: latestBlockhash,
          litNodeClient,
        });

        // Generate the authSig
        const authSig = await generateAuthSig({
          signer: signer,
          toSign,
        });

        return authSig;
      },
      capacityDelegationAuthSig,
    });
    return sessionSigs;
  }, [litNodeClient, provider, usedBlockchain]);

  const decryptFile = useCallback(async (data: {
    ciphertext: string,
    dataToEncryptHash: string,
    condition: AccessControlConditions,
    onProcess: (status: string) => void
  }): Promise<Blob> => {
    try {
      const { ciphertext, dataToEncryptHash, condition, onProcess } = data;
      if (!ciphertext || !dataToEncryptHash) {
        throw new Error("Invalid data format");
      }
      if (state.status !== "connected") {
        throw new Error("LitNodeClient is not connected");
      }
      console.log("Decrypting using condition:", condition);
      const sessionSigs = await getSessionSignatures(condition, onProcess);
      if (!sessionSigs) {
        throw new Error("Genearte Session signatures failed");
      }
      const { decryptedData } = await litNodeClient.decrypt({
        accessControlConditions: condition,
        chain: usedBlockchain,
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
      });
      return new Blob([decryptedData], { type: "application/octet-stream" });
    } finally {
      disconnectWeb3();
    }
  }, [getSessionSignatures, litNodeClient, state, usedBlockchain]);

  return (
    <LitProtocolContext.Provider value={{
      ...state,
      litNodeClient,
      encryptFile,
      decryptFile,
      switchLitNetwork
    }}>
      {children}
    </LitProtocolContext.Provider>
  );
}

export function useLitProtocol() {
  const context = useContext(LitProtocolContext);
  if (!context) {
    throw new Error("useLitProtocolContext must be used within a LitProtocolProvider");
  }
  return context;
}