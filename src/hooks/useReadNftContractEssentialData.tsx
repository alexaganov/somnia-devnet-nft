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
        return {
          maxNftAmountPerUser: Number(data[0]),
          mintPricePerNft: data[1],
          nftImageBaseUri: data[2],
          paymentErc20Address: data[3],
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
    ],
  });
};
