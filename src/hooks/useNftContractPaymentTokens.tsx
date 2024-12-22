import { TokenMetadata } from "@/types/web3";
import { Address } from "viem";
import { useReadNftContractEssentialData } from "./useReadNftContractEssentialData";
import { useERC20Token } from "./useERC20Token";
import { useMemo } from "react";
import { SOMNIA_NATIVE_TOKEN } from "@/constants";

export type NftPaymentToken = {
  id: string;
  meta: TokenMetadata;
} & (
  | {
      type: "native";
      contract?: undefined;
    }
  | {
      type: "erc20";
      contract: Address;
    }
);

export const useNftContractPaymentTokens = () => {
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const erc20TokenQuery = useERC20Token(
    nftContractEssentialData?.paymentErc20Address
  );

  const paymentTokens = useMemo(() => {
    const result: NftPaymentToken[] = [
      { id: "native", type: "native", meta: SOMNIA_NATIVE_TOKEN },
    ];

    if (erc20TokenQuery.data && nftContractEssentialData) {
      result.push({
        id: "erc20",
        type: "erc20",
        contract: nftContractEssentialData.paymentErc20Address,
        meta: erc20TokenQuery.data,
      });
    }

    return result;
  }, [nftContractEssentialData, erc20TokenQuery.data]);

  return {
    paymentTokens,
    query: erc20TokenQuery,
  };
};
