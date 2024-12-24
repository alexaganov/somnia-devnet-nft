import { TransactionToastDescription } from "@/components/common/TransactionToastDescription";
import { TOAST_MESSAGES } from "@/constants";
import { createToast, toast } from "@/providers/ToastProvider";
import { PaymentTokenErc20 } from "@/types/web3";
import { safeAsync } from "@/utils";
import {
  readErc20ContractAllowanceDetails,
  safeIncreaseErc20Allowance,
} from "@/utils/erc20";
import { getWeb3ErrorMessage } from "@/utils/error";
import { formatToken } from "@/utils/web3";
import { useMutation } from "@tanstack/react-query";
import { Address, Chain, erc20Abi, Hash, parseEventLogs } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

export const useEnsureErc20AllowanceWithFeedback = () => {
  const config = useConfig();
  const { address } = useAccount();
  const { refetch: refetchBalance } = useBalance({
    address,
  });

  return useMutation({
    mutationFn: async ({
      chain,
      token,
      amount,
      spender,
    }: {
      chain: Chain;
      token: PaymentTokenErc20;
      amount: bigint;
      spender: Address;
    }) => {
      if (!address) {
        throw new Error("Wallet is not connected");
      }

      const [allowanceDetailsError, allowanceDetails] = await safeAsync(
        readErc20ContractAllowanceDetails(config, {
          token: token.contract,
          account: address,
          requiredAmount: amount,
          spender,
        })
      );

      if (allowanceDetailsError) {
        toast.error("Couldn't verify allowance. Try again later");

        throw allowanceDetailsError;
      }

      if (allowanceDetails.hasRequiredAllowance) {
        return;
      }

      const allowanceToast = createToast("Allowance Increase");
      let txHash: Hash | null = null;

      try {
        allowanceToast.loading({
          description:
            "Waiting for you to approve the allowance increase in your wallet.",
        });

        txHash = await safeIncreaseErc20Allowance(config, {
          spender,
          token: token.contract,
          allowance: allowanceDetails.requiredAllowance,
        });

        // refetch to get fresh balance after gas deduction
        refetchBalance();

        allowanceToast.loading({
          description: (
            <TransactionToastDescription
              chain={chain}
              description={TOAST_MESSAGES.TX_PENDING}
              txHash={txHash}
            />
          ),
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        const parsedLogs = parseEventLogs({
          abi: erc20Abi,
          logs: receipt.logs,
        });

        const approval = parsedLogs.find((log) => log.eventName === "Approval");
        const isApprovedAmountInsufficient =
          approval && allowanceDetails.requiredAllowance > approval.args.value;

        if (isApprovedAmountInsufficient) {
          const formattedApprovedAmount = formatToken(
            approval.args.value,
            token.meta
          );
          const formattedRequiredAmount = formatToken(
            allowanceDetails.requiredAllowance,
            token.meta
          );
          const description = `Insufficient allowance. Required: ${formattedRequiredAmount}. Approved: ${formattedApprovedAmount}`;

          throw new Error(description);
        }

        allowanceToast.success({
          description: (
            <TransactionToastDescription
              chain={chain}
              description={TOAST_MESSAGES.TX_CONFIRMED}
              txHash={txHash}
            />
          ),
        });
      } catch (error) {
        const errorMessage = getWeb3ErrorMessage(error);

        allowanceToast.error({
          description: txHash ? (
            <TransactionToastDescription
              chain={chain}
              description={`Error: ${errorMessage}`}
              txHash={txHash}
            />
          ) : (
            errorMessage
          ),
        });

        throw error;
      }
    },
  });
};
