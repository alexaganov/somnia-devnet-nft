import { Address, InsufficientFundsError } from "viem";
import { PaymentToken } from "@/types/web3";
import usePaymentTokenBalance from "./usePaymentTokenBalance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/providers/ToastProvider";

export const useEnsureNftPaymentTokenBalanceWithFeedback = (
  account?: Address,
  token?: PaymentToken
) => {
  const {
    activeToken: { refetch: refetchTokenBalance },
  } = usePaymentTokenBalance(account, token);

  return useMutation({
    mutationFn: async ({ amount }: { amount: bigint }) => {
      const { data: freshTokenBalance, error: tokenBalanceError } =
        await refetchTokenBalance();

      if (tokenBalanceError || !freshTokenBalance) {
        const errorMessage =
          "Unable to verify account balance. Try again later.";
        toast.error(errorMessage);

        throw new Error(errorMessage);
      }

      if (amount > freshTokenBalance.value) {
        toast.error("Insufficient Funds", {
          description:
            "Please check your balance or deposit additional funds before trying again",
        });

        throw new InsufficientFundsError();
      }
    },
  });
};
