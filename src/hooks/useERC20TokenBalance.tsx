import { Address, erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

export const useERC20TokenBalance = (
  accountAddress?: Address,
  contractAddress?: Address
) => {
  return useReadContracts({
    query: {
      enabled: !!accountAddress && !!contractAddress,
      select: (data) => {
        return {
          value: data[0],
          decimals: data[1],
          name: data[2],
          symbol: data[3],
        };
      },
    },
    allowFailure: false,
    contracts: [
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "balanceOf",
        args: [accountAddress as Address],
      },
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
