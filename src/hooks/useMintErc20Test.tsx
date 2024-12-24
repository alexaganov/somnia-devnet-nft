import { createToast, toast } from "@/providers/ToastProvider";
import { Erc20TestAbi } from "@/types/abi/Erc20Test";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useConfig } from "wagmi";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import { TransactionToastDescription } from "@/components/common/TransactionToastDescription";
import { getWeb3ErrorMessage } from "@/utils/error";
import { somniaDevnet, TOAST_MESSAGES } from "@/constants";
import { useEnsureChainWithFeedback } from "./useEnsureChainWithFeedback";
import { formatToken } from "@/utils/web3";
import { PaymentTokenErc20 } from "@/types/web3";

export const useMintErc20TestWithFeedback = () => {
  const config = useConfig();
  const { address } = useAccount();

  const { mutateAsync: ensureChainWithFeedback } = useEnsureChainWithFeedback();

  return useMutation({
    mutationFn: async ({
      amount,
      token,
    }: {
      amount: bigint;
      token: PaymentTokenErc20;
    }) => {
      if (!address) {
        const errorMessage = "Wallet is not connect";

        toast.error(errorMessage);

        throw new Error(errorMessage);
      }

      const chain = somniaDevnet;

      await ensureChainWithFeedback(chain);

      const mintToast = createToast(
        `Minting ${formatToken(amount, token.meta)}`
      );

      mintToast.loading({
        description: "Checking if transaction is possible",
      });

      try {
        const txSimulation = await simulateContract(config, {
          address: token.contract,
          abi: Erc20TestAbi,
          functionName: "mint",
          args: [address, amount],
        });

        mintToast.loading({
          description: TOAST_MESSAGES.CONFIRM_TX_IN_WALLET,
        });

        const txHash = await writeContract(config, txSimulation.request);

        mintToast.loading({
          description: (
            <TransactionToastDescription
              description={TOAST_MESSAGES.TX_PENDING}
              txHash={txHash}
              chain={chain}
            />
          ),
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
        });

        mintToast.success({
          description: (
            <TransactionToastDescription
              description={TOAST_MESSAGES.TX_CONFIRMED}
              txHash={txHash}
              chain={chain}
            />
          ),
        });

        return receipt;
      } catch (error) {
        mintToast.error({
          description: getWeb3ErrorMessage(error),
        });

        throw error;
      }
    },
  });
};
