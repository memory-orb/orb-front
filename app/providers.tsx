"use client";
import { ArweaveProvider } from "@/contexts/arweaveContext";
import { ChatProvider } from "@/contexts/chatContext";
import { EthersProvider } from "@/contexts/ethersContext";
import { LitProtocolProvider } from "@/contexts/litProtocolContext";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <EthersProvider>
        <LitProtocolProvider>
          <ArweaveProvider>
            <ChatProvider>{children}</ChatProvider>
          </ArweaveProvider>
        </LitProtocolProvider>
      </EthersProvider>
    </HeroUIProvider>
  );
}