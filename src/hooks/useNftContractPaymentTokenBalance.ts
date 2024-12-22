import { Address } from "viem";
import { NftPaymentToken } from "./useNftContractPaymentTokens";
import { useERC20TokenBalance } from "./useERC20TokenBalance";
import { useBalance } from "wagmi";

export const useNftContractPaymentTokenBalance = (
  accountAddress?: Address,
  paymentToken?: NftPaymentToken
) => {
  const erc20TokenQuery = useERC20TokenBalance(
    accountAddress,
    paymentToken?.contract
  );
  const nativeTokenQuery = useBalance({
    address: accountAddress,
  });

  return paymentToken?.type === "erc20" ? erc20TokenQuery : nativeTokenQuery;
};

export default useNftContractPaymentTokenBalance;
