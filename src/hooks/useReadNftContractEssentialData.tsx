import { NFT_CONTRACT } from "@/constants";
import { QuerySuccessDataType } from "@/types/common";
import { useReadContracts } from "wagmi";

export type NftContractEssentialData = QuerySuccessDataType<
  typeof useReadNftContractEssentialData
>;

export const useReadNftContractEssentialData = () => {
  return useReadContracts({
    query: {
      select(data) {
        const currentNftId = data[4];

        return {
          // Subtract 1 because the maximum amount is exclusive (upper limit not included)
          maxNftAmountPerUser: Number(data[0]) - 1,
          mintPricePerNft: data[1],
          nftImageBaseUri: data[2],
          paymentErc20Address: data[3],
          currentNftId,
          totalMinted: currentNftId - BigInt(1),
        };
      },
    },
    allowFailure: false,
    contracts: [
      {
        ...NFT_CONTRACT,
        functionName: "MAX_TOKENS_PER_USER",
      },
      {
        ...NFT_CONTRACT,
        functionName: "PRICE",
      },
      {
        ...NFT_CONTRACT,
        functionName: "baseURI",
      },
      {
        ...NFT_CONTRACT,
        functionName: "paymentERC20",
      },
      {
        ...NFT_CONTRACT,
        functionName: "tokenId",
      },
    ],
  });
};
