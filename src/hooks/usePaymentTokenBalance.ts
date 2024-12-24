import { Address } from "viem";
import { PaymentToken } from "@/types/web3";
import { useErc20TokenBalance } from "./useErc20TokenBalance";
import { useBalance } from "wagmi";

export const usePaymentTokenBalance = (
  accountAddress?: Address,
  paymentToken?: PaymentToken
) => {
  const erc20 = useErc20TokenBalance(accountAddress, paymentToken?.contract);
  const native = useBalance({
    address: accountAddress,
  });

  return {
    erc20,
    native,
    activeToken: paymentToken?.type === "erc20" ? erc20 : native,
  };
};

export default usePaymentTokenBalance;
