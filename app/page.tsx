"use client";
import { FloatTech, OrbButton, WalletButton } from "@/utils/styled";
import Link from "next/link";
import styled, { keyframes } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  z-index: 1;
  position: relative;
`

const Title = styled.h1`
  font-family: var(--font-orbitron), sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent-color);
  text-shadow: 0 0 25px var(--glow-color), 0 0 60px var(--accent-color);
  animation: ${FloatTech} 5s ease-in-out infinite;
  text-align: center;
  margin-top: 6rem;
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.7;
`

const Enter = styled.div`
  margin-top: 4rem;
  opacity: 0.6;
  animation: ${FloatTech} 3s ease-in-out infinite;
`

export default function HomePage() {
  return (
    <div className="text-[#D3F4FF]">
      <WalletButton>🔗 Connect Wallet</WalletButton>
      <Container>
        <Title>Memory-ORB</Title>
        <Subtitle>连接神经云，唤醒你的多维记忆节点</Subtitle>
        <div className="flex gap-4">
          <Link href="/chat"><OrbButton>Build Memory</OrbButton></Link>
          <Link href="/memories"><OrbButton>Explore Memories</OrbButton></Link>
        </div>
        <Enter>
          ↓ Enter the Second World
        </Enter>
      </Container>
    </div>
  );
}
