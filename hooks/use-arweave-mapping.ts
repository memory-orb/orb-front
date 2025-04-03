import { useEthers } from "@/contexts/ethersContext";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import arweaveMappingAbi from "@/artifacts/contracts/ArweaveMapping.sol/ArweaveMapping.json";

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
  const [arweaveMappingContract] = useState(() => new ethers.Contract(process.env.NEXT_PUBLIC_ARWEAVE_MAPPING_CONTRACT!, arweaveMappingAbi.abi, bscProvider));

  return {
    getUploadedMemories: async (offset: number, limit: number): Promise<ArweaveMappingValue[]> => {
      if (!arweaveMappingContract) return [];
      const result = await arweaveMappingContract.getRegisteredAddresses(offset, limit);
      return result.map(([address, arweaveId, price, description]: string[]) => ({
        address,
        arweaveId,
        price,
        description,
      }));
    },
    getMemoryAmount: async (): Promise<number> => {
      if (!arweaveMappingContract) return 0;
      const total = await arweaveMappingContract.getTotalRegisteredAddresses() as BigNumber;
      return total.toNumber();
    },
    addMemoryMapping: async (params: Omit<ArweaveMappingValue, 'address'>) => {
      const { arweaveId, price, description } = params;
      if (!arweaveMappingContract) throw new Error("Arweave mapping contract not initialized");

      const ethProvider = await requireProvider();
      await requireNetwork("bscTestnet");
      const signer = ethProvider.getSigner();
      const contractWithSigner = arweaveMappingContract.connect(signer);
      console.log(contractWithSigner);
      const tx = await contractWithSigner.setArweaveTxId(arweaveId, description, price);
      console.log(tx);
    },
  };
}
