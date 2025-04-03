"use client";
import { useEffect, useState } from "react";
import styles from "./memories.module.css";
import MemoryCard from "@/components/MemoryCard";
import styled from "styled-components";
import { FloatTech } from "@/utils/styled";
import { useArweave } from "@/contexts/arweaveContext";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";

const Title = styled.h1`
  font-family: var(--font-orbitron), sans-serif;
  font-size: 5rem;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent-color);
  text-align: center;
  text-shadow: 0 0 25px var(--glow-color), 0 0 60px var(--accent-color);
  animation: ${FloatTech} 5s ease-in-out infinite;
`

export default function MemoriesPage() {
  const [memoryList, setMemoryList] = useState<ArweaveMappingValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getUploadedMemories, getMemoryAmount } = useArweave();

  useEffect(() => {
    const fetchUploadedList = async () => {
      try {
        setLoading(true);
        console.log("Loading memory list");
        const uploadedList = await getUploadedMemories(0, 1);
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
