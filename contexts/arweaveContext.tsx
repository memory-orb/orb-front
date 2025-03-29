"use client";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ArweaveContext = createContext<{
  walletAddress: string | null;
  balance: string;
  generateKey: () => Promise<void>;
  uploadFile: (data: ArrayBuffer) => Promise<string | undefined>;
  fetchFile: (transactionId: string) => Promise<ArrayBuffer>;
}>({
  walletAddress: null,
  balance: "",
  generateKey: async () => { },
  uploadFile: async (data: ArrayBuffer) => { throw new Error("uploadFile not implemented"); },
  fetchFile: async (transactionId: string) => { throw new Error("fetchFile not implemented"); },
});

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => Arweave.init({}));

  const [privateKey, setPrivateKey] = useState<JWKInterface | "use_wallet">("use_wallet");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("");

  const generateKey = useCallback(async () => {
    const generatedKey = await client.wallets.generate();
    console.log("[Arweave] Generated Key:", generatedKey);
    setPrivateKey(generatedKey);
    localStorage.setItem("arweaveKey", JSON.stringify(generatedKey));
  }, [client]);

  useEffect(() => {
    const storedKey = localStorage.getItem("arweaveKey");
    if (storedKey) {
      setPrivateKey(JSON.parse(storedKey));
    } else {
      generateKey();
    }
  }, [generateKey]);

  useEffect(() => {
    if (privateKey !== "use_wallet") {
      client.wallets.jwkToAddress(privateKey).then((address) => {
        setWalletAddress(address);
        console.log("[Arweave] Wallet Address:", address);
      });
    }
  }, [privateKey, client]);

  const updateBalance = useCallback(() => {
    client.wallets.getBalance(walletAddress ?? "").then((balance) => {
      console.log(
        "[Arweave] Wallet Balance:",
        client.ar.winstonToAr(balance),
        "AR"
      );
      setBalance(balance);
    });
  }, [client, walletAddress]);

  const uploadFile = useCallback(
    async (data: ArrayBuffer) => {
      console.log("[Arweave] Uploading file to Arweave...", data);
      if (!privateKey) {
        console.error("Private key not available");
        throw new Error("Private key not available");
      }
      const transation = await client.createTransaction(
        { data: data },
        privateKey
      );
      await client.transactions.sign(transation, privateKey);
      const res = await client.transactions.post(transation);
      if (res.status === 200) {
        updateBalance();
        return transation.id;
      } else {
        console.error("Transaction failed:", res.statusText);
        throw new Error("Transaction failed");
      }
    },
    [client, privateKey, updateBalance]
  );

  const fetchFile = useCallback(
    async (transactionId: string) => {
      const data = await client.transactions.getData(transactionId, {
        decode: true,
        string: false,
      });
      console.log("Fetched file data:", data);
      if (data instanceof Uint8Array) {
        return data.buffer as ArrayBuffer;
      }
      const encoder = new TextEncoder();
      return encoder.encode(data).buffer as ArrayBuffer;
    },
    [client]
  );

  useEffect(() => {
    if (walletAddress) {
      updateBalance();
    }
  }, [updateBalance, walletAddress]);

  return (
    <ArweaveContext.Provider
      value={{
        walletAddress,
        balance,
        fetchFile,
        uploadFile,
        generateKey,
      }}
    >
      {children}
    </ArweaveContext.Provider>
  );
}

export function useArweave() {
  return useContext(ArweaveContext);
}
