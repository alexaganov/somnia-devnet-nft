import { TokenMetadata } from "@/types/web3";
import { Address, erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

export const useErc20Token = (contractAddress?: Address) => {
  return useReadContracts({
    query: {
      enabled: !!contractAddress,
      select: (data) => {
        const token: TokenMetadata = {
          decimals: data[0],
          name: data[1],
          symbol: data[2],
        };

        return token;
      },
    },
    allowFailure: false,
    contracts: [
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "symbol",
      },
    ],
  });
};
