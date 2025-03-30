"use client";
import { ArweaveMappingValue } from "@/contexts/ethersContext";
import styles from "./memorie-card.module.css";
import { OrbButton } from "@/utils/styled";

export default function MemoryCard({ data }: { data: ArweaveMappingValue }) {
  return (
    <div className={styles.memoryCard}>
      <div className={styles.memoryContent}>
        <div className={styles.titleRow}>
          <div className={styles.memoryTitle}>{data.address.substring(0, 6)}...{data.address.substring(data.address.length - 4)}</div>
          <div className={styles.balanceRequirement}>💰 钱包余额 ≥ {data.price} 才可下载</div>
        </div>
        <div className="mt-2">
          <OrbButton>从云端下载</OrbButton>
        </div>
      </div>
      <div className={styles.memorySummary}>{data.description}</div>
    </div>
  )
}
