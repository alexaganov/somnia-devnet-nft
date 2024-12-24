import { PaymentToken } from "@/types/web3";
import { useReadNftContractEssentialData } from "./useReadNftContractEssentialData";
import { useErc20Token } from "./useErc20Token";
import { useMemo } from "react";
import { SOMNIA_NATIVE_TOKEN } from "@/constants";

const nativePaymentToken: PaymentToken = {
  id: "native",
  type: "native",
  meta: SOMNIA_NATIVE_TOKEN,
};

export const useNftContractPaymentTokens = () => {
  const { data: nftContractEssentialData } = useReadNftContractEssentialData();

  const erc20TokenQuery = useErc20Token(
    nftContractEssentialData?.paymentErc20Address
  );

  const paymentTokens = useMemo(() => {
    const result: PaymentToken[] = [nativePaymentToken];

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
    nativePaymentToken,
    paymentTokens,
    query: erc20TokenQuery,
  };
};
