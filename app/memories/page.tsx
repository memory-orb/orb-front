"use client";

import { useEthers } from "@/contexts/ethersContext";
import { useEffect, useState } from "react";
import styles from "./memories.module.css";
import { FlexDiv } from "@/utils/styled";

export default function MemoriesPage() {
  const [memoryList, setMemoryList] = useState<{ address: string; arweaveId: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getUploadedList, getTotalRegisteredAddresses } = useEthers();

  useEffect(() => {
    const fetchUploadedList = async () => {
      try {
        setLoading(true);
        const totalRegisteredAddresses = await getTotalRegisteredAddresses();
        console.log("Total Registered Addresses:", totalRegisteredAddresses.toString());
        const uploadedList = await getUploadedList(0, 1);
        console.log("Uploaded List:", uploadedList);
        setMemoryList(uploadedList);
      } catch (error) {
        console.error("获取记忆列表失败:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUploadedList();
  }, [getTotalRegisteredAddresses, getUploadedList]);

  return (
    <div className="px-8 py-4 max-w-[1200px] mx-auto">
      <header className="">
        <h1 className={styles.title}>Memories</h1>
        <div className={styles.divider}></div>
      </header>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : memoryList.length > 0 ? (
        <div className={styles.grid}>
          {memoryList.map((memory, index) => (
            <div className={styles.cardWrapper} key={index}>
              <div className={styles.card}>
                <FlexDiv className="flex-col p-6">
                  <FlexDiv className="gap-2 flex-row">
                    <span>Address:</span>
                    <span>{memory.address}</span>
                  </FlexDiv>
                  <FlexDiv className="gap-2 flex-row">
                    <span>Arweave&nbsp;ID:</span>
                    <span>{memory.arweaveId}</span>
                  </FlexDiv>
                </FlexDiv>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No Memory Data</p>
        </div>
      )}
    </div>
  )
}