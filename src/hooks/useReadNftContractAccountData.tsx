import { NFT_CONTRACT } from "@/constants";
import { QuerySuccessDataType } from "@/types/common";
import { transformTokensIdsToNfts } from "@/utils/nft";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

export type NftContractAccountData = QuerySuccessDataType<
  typeof useReadNftContractAccountData
>;

export const useReadNftContractAccountData = (accountAddress?: Address) => {
  return useReadContracts({
    query: {
      enabled: !!accountAddress,
      select(data) {
        const tokensIds = data[0];
        // Subtract 1 because the maximum amount is exclusive (upper limit not included)
        const maxTokensPerUser = Number(data[1]) - 1;

        const maxMintAmount = maxTokensPerUser - tokensIds.length;
        const minMintAmount = Math.min(maxMintAmount, 1);

        return {
          nfts: transformTokensIdsToNfts(tokensIds),
          maxMintAmount,
          minMintAmount,
          isAllMinted: tokensIds.length >= maxTokensPerUser,
        };
      },
    },
    allowFailure: false,
    contracts: [
      {
        ...NFT_CONTRACT,
        functionName: "tokensOf",
        args: [accountAddress as Address],
      },
      {
        ...NFT_CONTRACT,
        functionName: "MAX_TOKENS_PER_USER",
      },
    ],
  });
};
