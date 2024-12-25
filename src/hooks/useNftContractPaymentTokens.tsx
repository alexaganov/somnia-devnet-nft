import { PaymentToken, PaymentTokenErc20 } from "@/types/web3";
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

  const erc20Query = useErc20Token(
    nftContractEssentialData?.paymentErc20Address
  );

  const erc20 = useMemo(() => {
    if (!erc20Query.data || !nftContractEssentialData?.paymentErc20Address) {
      return;
    }

    const result: PaymentTokenErc20 = {
      id: "erc20",
      type: "erc20",
      contract: nftContractEssentialData.paymentErc20Address,
      meta: erc20Query.data,
    };

    return result;
  }, [erc20Query.data, nftContractEssentialData]);

  return {
    native: nativePaymentToken,
    erc20,
    erc20Query,
  };
};
