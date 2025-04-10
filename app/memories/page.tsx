"use client";
import { useEffect, useState } from "react";
import styles from "./memories.module.css";
import MemoryCard from "@/components/MemoryCard";
import { useArweave } from "@/contexts/arweaveContext";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";
import { Title } from "@/utils/styled";

export default function MemoriesPage() {
  const [memoryList, setMemoryList] = useState<ArweaveMappingValue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { getUploadedMemories, getMemoryAmount } = useArweave();

  useEffect(() => {
    const fetchUploadedList = async () => {
      if (loading) return;
      try {
        setLoading(true);
        console.log("Loading memory list");
        const uploadedList = await getUploadedMemories();
        setMemoryList(uploadedList);
      } catch (error) {
        console.error("获取记忆列表失败:", error);
      } finally {
        console.log("Loading memory list finished");
        setLoading(false);
      }
    };
    fetchUploadedList();
  }, [getMemoryAmount, getUploadedMemories]);

  return (
    <div className="px-8 py-16 m-auto max-w-[1000px]">
      <Title>Explore Memories</Title>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : memoryList.length > 0 ? (
        <>
          {memoryList.map((memory, index) => (
            <MemoryCard data={memory} key={`memory-${index}`} />
          ))}
        </>
      ) : (
        <div className={styles.emptyState}>
          <p>No Memory Data</p>
        </div>
      )}
    </div>
  )
}
