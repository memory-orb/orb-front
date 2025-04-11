"use client";
import { useEthers } from "@/contexts/ethersContext";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { abi as MemoryMappingAbi } from "@/artifacts/contracts/MemoryMapping.sol/MemoryMapping.json";

export interface ArweaveMappingValue {
  address: string;
  arweaveId: string;
  price: string;
  description: string;
}

const bscTestnetRpc = "https://broken-evocative-surf.bsc-testnet.quiknode.pro/11f750973f8f44ad331023073451c2eaee951114/";

export const useArweaveMapping = () => {
  const { requireProvider, requireNetwork } = useEthers();
  const [bscProvider] = useState(() => new ethers.providers.JsonRpcProvider(bscTestnetRpc));
  const [memoryMappingContract] = useState(() => new ethers.Contract(process.env.NEXT_PUBLIC_ARWEAVE_MAPPING_CONTRACT!, MemoryMappingAbi, bscProvider));

  return {
    getUploadedMemories: async (): Promise<ArweaveMappingValue[]> => {
      if (!memoryMappingContract) return [];
      const result = await memoryMappingContract.getLatestMemories();
      return result.map(([address, arweaveId, price, description]: string[]) => ({
        address,
        arweaveId,
        price,
        description,
      }));
    },
    getMemoryAmount: async (): Promise<number> => {
      if (!memoryMappingContract) return 0;
      const total = await memoryMappingContract.getTotalRegisteredAddresses() as BigNumber;
      return total.toNumber();
    },
    addMemoryMapping: async (params: Omit<ArweaveMappingValue, 'address'>) => {
      const { arweaveId, price, description } = params;
      if (!memoryMappingContract) throw new Error("Arweave mapping contract not initialized");

      const ethProvider = await requireProvider();
      await requireNetwork("bscTestnet");
      const signer = ethProvider.getSigner();
      const contractWithSigner = memoryMappingContract.connect(signer);
      console.log(contractWithSigner);
      const tx = await contractWithSigner.addMemory(arweaveId, description, price);
      console.log(tx);
    },
  };
}
