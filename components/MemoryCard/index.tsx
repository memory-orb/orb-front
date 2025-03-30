"use client";
import { ArweaveMappingValue } from "@/contexts/ethersContext";
import styles from "./memorie-card.module.css";
import { OrbButton } from "@/utils/styled";
import { useState } from "react";
import { useArweave } from "@/contexts/arweaveContext";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { addToast } from "@heroui/react";

export default function MemoryCard({ data }: { data: ArweaveMappingValue }) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [status, setStatus] = useState("");
  const { fetchFile } = useArweave();
  const { decryptFile } = useLitProtocol();
  const decode = new TextDecoder("utf-8");

  const handleDownload = async () => {
    try {
      setIsDecrypting(true);
      setStatus("Fetching");
      const fileBuffer = await fetchFile(data.arweaveId);
      if (!fileBuffer) {
        throw new Error("File not found");
      }
      const fileData = decode.decode(fileBuffer);
      const { ciphertext, dataToEncryptHash, condition, originalFileName } = JSON.parse(fileData);
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
      console.error("Error downloading file:", error);
      addToast({ color: "danger", title: "Export memory failed", description: `${error}` });
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
