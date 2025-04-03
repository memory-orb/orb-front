"use client";
import styles from "./memorie-card.module.css";
import { OrbButton } from "@/utils/styled";
import { useState } from "react";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { addToast } from "@heroui/react";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";
import { useEthers } from "@/contexts/ethersContext";

export default function MemoryCard({ data }: { data: ArweaveMappingValue }) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [status, setStatus] = useState("");
  const { connectStatus } = useEthers();
  const { decryptFile } = useLitProtocol();

  const handleDownload = async () => {
    try {
      if (connectStatus !== "connected") {
        addToast({ color: "warning", title: "Wallet not connected", description: "Please connect your wallet" });
        return;
      }
      setIsDecrypting(true);
      setStatus("Fetching");
      const jsonData = await fetch(`https://arweave.net/${data.arweaveId}`);
      const jsonText = await jsonData.text();
      const { ciphertext, dataToEncryptHash, condition, originalFileName } = JSON.parse(jsonText);
      if (!ciphertext || !dataToEncryptHash) {
        throw new Error("Invalid file format");
      }
      setStatus("Decrypting");
      const blob = await decryptFile({
        ciphertext,
        dataToEncryptHash,
        condition
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalFileName || "decrypted_file.snapshot";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error decrypting file:", error);
      const { cause } = error as { cause?: { reason: string } };
      addToast({ color: "danger", title: "Export memory failed", description: `${cause?.reason ?? error}` });
    } finally {
      setIsDecrypting(false);
      setStatus("");
    }
  };

  return (
    <div className={styles.memoryCard}>
      <div className={styles.memoryContent}>
        <div className={styles.titleRow}>
          <div className={styles.memoryTitle}>{data.address.substring(0, 6)}...{data.address.substring(data.address.length - 4)}</div>
          <div className={styles.balanceRequirement}>💰 钱包余额 ≥ {data.price} 才可下载</div>
        </div>
        <div className="mt-2">
          <OrbButton onClick={handleDownload}>{isDecrypting ? status : "Download"}</OrbButton>
        </div>
      </div>
      <div className={styles.memorySummary}>{data.description}</div>
    </div>
  )
}
