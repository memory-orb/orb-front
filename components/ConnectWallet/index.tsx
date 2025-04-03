"use client";
import { useEthers } from "@/contexts/ethersContext";
import { addToast } from "@heroui/react";
import styled from "styled-components";

const WalletButton = styled.button`
  position: fixed;
  top: 20px;
  right: 30px;
  padding: 8px 16px;
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(5px);
  color: var(--text-color);
  cursor: pointer;
  z-index: 2;
  transition: 0.3s;
  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
  }
`

export default function ConnectWallet() {
  const { requireProvider, connectStatus } = useEthers();

  return (
    <WalletButton disabled={connectStatus !== "disconnected"} onClick={async () => {
      try {
        console.log("Connecting wallet...");
        await requireProvider();
        addToast({ title: "Wallet connected", color: "success" });
      } catch (error) {
        addToast({ title: "Connect wallet failed", description: `${error}`, color: "danger" });
      }
    }}>
      {
        connectStatus === "connected" ? "✅ Wallet Connected" :
          connectStatus === "connecting" ? "🔄 Connecting..." : "🔗 Connect Wallet"
      }
    </WalletButton>
  )
}
